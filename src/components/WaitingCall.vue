<template>
  <a-row>
    <a-col :span="12" :offset="6">
      <a-card :bordered="true">
        <a-row>
          <a-col :span="8">
            <h2>Status:</h2>
            <pre>{{ status }}</pre>
          </a-col>
          <a-col :span="8">
            <h2>Agent Identity:</h2>
            <pre>{{ identity || "Unknown" }}</pre>
          </a-col>
          <a-col :span="8">
            <a-button
              type="primary"
              @click="deviceConnect"
              v-if="status !== 'Online'"
              :loading="status === 'Registering...'"
            >
              Connect
            </a-button>
            <a-button type="primary" @click="deviceDisconnect" danger v-else>
              Disconnect
            </a-button>
          </a-col>
          <a-col :span="24" v-if="error">
            <h2>Error:</h2>
            <p>{{ error }}</p>
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
  <a-row justify="left">
    <a-col :span="12" :offset="6">
      <a-card title="Events Timeline" :bordered="true">
        <TimelineComponent :timelineData="timelineData" />
      </a-card>
    </a-col>
  </a-row>
  <a-divider />
  <a-row>
    <a-col :span="12" :offset="6">
      <a-space direction="horizontal">
        <a-button type="link" @click="showIncomingModal" block
          >Show Incoming Modal
        </a-button>
        <a-button type="link" @click="showInProgressModal" block
          >Show In Progress Modal
        </a-button>
      </a-space>
    </a-col>
  </a-row>
  <a-modal
    v-model:open="openIncomingModal"
    title="Incoming Call"
    @ok="handleCallAccept"
    @cancel="handleCallReject"
    ok-text="Accept"
    cancel-text="Reject"
    :cancel-button-props="{ danger: true, type: 'primary' }"
  >
    <a-typography-title
      >{{ incomingCall?.parameters?.From || "+PHONE_NUMBER" }}
    </a-typography-title>
  </a-modal>
  <a-modal
    v-model:open="openCallInProgressModal"
    title="Call in Progress"
    @ok="handleCallDisconnect"
    :closable="false"
    :maskClosable="false"
  >
    <template #footer>
      <a-button key="submit" type="primary" @click="handleCallDisconnect"
        >Disconnect
      </a-button>
    </template>
    <a-descriptions bordered :column="1">
      <a-descriptions-item label="From">
        {{ incomingCall?.parameters?.From || "+PHONE_NUMBER" }}
      </a-descriptions-item>
      <a-descriptions-item label="Duration">
        {{ timer.formatted }}
      </a-descriptions-item>
    </a-descriptions>
    <a-typography-paragraph></a-typography-paragraph>
  </a-modal>
</template>

<script lang="ts">
/* eslint-disable */
import { Options, Vue } from "vue-class-component";
import axios from "axios";
import { Call, Device } from "@twilio/voice-sdk";
import { toRaw } from "vue";
import _ from "lodash";
import TimelineComponent from "@/components/Timeline/TimelineComponent.vue";
import moment from "moment";
import {
  TimelineItem,
  TimelineTypes,
} from "@/components/Timeline/TimelineInterface.vue";

interface TimerInterface {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  intervalId: any;
}

@Options({
  components: {
    TimelineComponent,
  },
})
export default class WaitingCall extends Vue {
  agent = "erickengelhardt";
  error = "";
  status = "Disconnected";
  identity = "Unknown";
  device?: Device;
  openIncomingModal = false;
  openCallInProgressModal = false;
  incomingCall?: Call | null = null;
  callParams?: any | null = null;
  timer: TimerInterface = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    formatted: `"00:00:00"`,
    intervalId: null,
  };
  timelineData: TimelineItem[] = [
    {
      message: "Welcome!",
      date: moment(),
      type: "success",
    },
  ];

  showIncomingModal = () => {
    this.timelineData.push({
      message: "Incoming call",
      date: moment(),
      type: "success",
    });
    this.openIncomingModal = true;
  };

  showInProgressModal = () => {
    this.openIncomingModal = false;
    this.openCallInProgressModal = true;
    this.startTimer();
  };

  handleCallAccept = async () => {
    console.log("Call accepted", this.incomingCall);
    this.log("Call accepted", "success");

    if (!this.incomingCall) {
      console.log("No incoming call");
      return;
    }

    const incomingCallCopy = this.prepareCallInstance(this.incomingCall);
    try {
      incomingCallCopy.accept();
      console.log("accept1");
    } catch (e) {
      console.log(e);
    }
    this.showInProgressModal();
  };

  prepareCallInstance = (call?: Call | null): Call => {
    if (!call) {
      console.error("No call to prepare");
    }
    let incomingCallCopy = _.cloneDeepWith(this.incomingCall, toRaw);
    incomingCallCopy.on("accept", this.handleIncomingCallAccept);
    incomingCallCopy.on("cancel", this.handleIncomingCallDisconnect);
    incomingCallCopy.on("disconnect", this.handleIncomingCallDisconnect);
    incomingCallCopy.on("reject", this.handleIncomingCallDisconnect);
    return incomingCallCopy;
    // return call as Call;
  };

  handleCallReject = async () => {
    this.log("Call rejected", "error");
    let incomingCallCopy: Call = this.prepareCallInstance(this.incomingCall);

    const callSid = incomingCallCopy?.parameters?.CallSid;
    if (!callSid) {
      console.error("No callSid to reject");
      return;
    }
    const url = `http://127.0.0.1:8000/api/call_reject?callSid=${callSid}`;
    try {
      await axios.get(url);
    } catch (e) {
      console.log(e);
    }
    try {
      //   this.incomingCall?.reject();
      this.incomingCall?.disconnect();
      console.log("disconnect");
    } catch (e) {
      console.log(e);
    }
    this.resetTimer();
    this.incomingCall = undefined;
    this.openCallInProgressModal = false;
  };

  handleCallDisconnect = () => {
    this.log("Disconnect Call", "warning");
    this.resetTimer();
    const incomingCallCopy = this.prepareCallInstance(this.incomingCall);
    try {
      incomingCallCopy?.reject();
      incomingCallCopy?.disconnect();
    } catch (e) {
      console.log(e);
    }
    this.openCallInProgressModal = false;
  };

  handleIncomingCall(call: Call) {
    call.on("accept", this.handleIncomingCallAccept);
    call.on("cancel", this.handleIncomingCallDisconnect);
    call.on("disconnect", this.handleIncomingCallDisconnect);
    call.on("reject", this.handleIncomingCallDisconnect);

    this.log("Incoming Call", "processing");

    this.setCall(call);
  }

  handleIncomingCallDisconnect() {
    this.openIncomingModal = false;
    this.openCallInProgressModal = false;
    try {
      this.log("The call has been disconnected.", "warning");
    } catch (e) {
      console.error(e);
    }
  }

  handleIncomingCallAccept() {
    try {
      this.log("The call has been accepted.", "success");
    } catch (e) {
      console.error(e);
    }
  }

  log(message: string, type: TimelineTypes = "default", date = null) {
    console.log(message);
    this.timelineData.push({
      message,
      type,
      date: date || moment(),
    });
  }

  /* eslint-disable */
  async deviceConnect() {
    try {
      const response = await this.getAccessToken();

      if (response.data) {
        await this.initializeDevice(response.data);
      }
      this.error = "";
    } catch (error) {
      console.error("Error making API request:", error);
      this.error = "Error making API request. See console for details.";
    }
  }

  async getAccessToken() {
    const url = `http://127.0.0.1:8000/api/access_token?identity=${this.agent}`;
    return await axios.get(url);
  }

  async deviceDisconnect() {
    this.device?.destroy();
    this.identity = "Unknown";
  }

  async initializeDevice(data: any) {
    const { token, identity } = data;
    this.identity = identity;
    this.device = new Device(token);

    this.device.on("tokenWillExpire", async () => {
      return await this.getAccessToken().then((data) =>
        this.device?.updateToken(data.data.token)
      );
    });

    this.device.on("registered", () => {
      this.status = "Online";
      this.log("The device is ready to receive incoming calls.", "success");
    });

    this.device.on("destroyed", () => {
      this.log("Session destroyed", "warning");
    });

    this.device.on("error", (error) => {
      this.error = "Twilio Device error. See console for details.";
      this.log("Twilio Device error", "error");
      console.error(error);
    });

    this.device.on("registering", () => {
      this.log("Registering", "processing");
      this.status = "Registering...";
    });

    this.device.on("unregistered", () => {
      this.log("Unregistered", "warning");
      this.status = "Disconnected";
    });

    this.device.on("incoming", this.handleIncomingCall);

    try {
      await this.device.register();
    } catch (e) {
      this.status = "Error";
      console.error("Cannot register device", e);
    }
  }

  setCall = async (call: Call) => {
    this.incomingCall = call;
    this.callParams = call.parameters;
    this.openIncomingModal = true;
    console.log(call);
  };

  startTimer() {
    this.timer.intervalId = setInterval(() => {
      this.timer.seconds++;
      if (this.timer.seconds >= 60) {
        this.timer.minutes++;
        this.timer.seconds = 0;
      }
      if (this.timer.minutes >= 60) {
        this.timer.hours++;
        this.timer.minutes = 0;
      }
      const { hours, minutes, seconds } = this.timer;
      this.timer.formatted = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  resetTimer() {
    this.timer.hours = 0;
    this.timer.minutes = 0;
    this.timer.seconds = 0;
    clearInterval(this.timer.intervalId);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
