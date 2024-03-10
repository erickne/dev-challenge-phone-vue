<template>
  <div>
    <div v-if="status">
      <h2>Status:</h2>
      <pre>{{ status }}</pre>
    </div>
    <div v-if="error">
      <h2>Error:</h2>
      <p>{{ error }}</p>
    </div>
  </div>

  <a-row>
    <a-col :span="12" :offset="6">
      <a-button
        type="primary"
        @click="deviceConnect"
        v-if="status !== 'Online'"
      >
        Connect
      </a-button>
      <a-button type="primary" @click="deviceDisconnect" danger v-else>
        Disconnect
      </a-button>
    </a-col>
  </a-row>
  <a-divider />
  <a-row>
    <a-col :span="12" :offset="6">
      <a-button type="primary" @click="showIncomingModal"
        >Show Incoming Modal</a-button
      >
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="12" :offset="6">
      <a-button type="primary" @click="showInProgressModal"
        >Show In Progress Modal</a-button
      >
    </a-col>
  </a-row>
  <div>
    <a-modal
      v-model:open="openIncomingModal"
      title="Incoming Call"
      @ok="handleCallAccept"
      @cancel="handleCallReject"
      ok-text="Accept"
      cancel-text="Reject"
      :cancel-button-props="{ danger: true, type: 'primary' }"
    >
      <a-typography-title>{{
        incomingCall?.parameters?.From
      }}</a-typography-title>
    </a-modal>
    <a-modal
      v-model:open="openCallInProgressModal"
      title="Attention"
      @ok="handleCallDisconnect"
    >
      <template #footer>
        <a-button key="submit" type="primary" @click="handleCallDisconnect"
          >Disconnect</a-button
        >
      </template>
      <a-typography-title>{{
        incomingCall?.parameters?.From
      }}</a-typography-title>
      <a-typography-text>Call in progress</a-typography-text>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import axios from "axios";
import { Call, Device } from "@twilio/voice-sdk";
import { toRaw } from "vue";
import _ from "lodash";

export default class WaitingCall extends Vue {
  agent = "erickengelhardt";
  error = "";
  status = "Disconnected";
  device?: Device;
  openIncomingModal = false;
  openCallInProgressModal = false;
  incomingCall?: Call | null = null;
  callParams?: any | null = null;

  showIncomingModal = () => {
    this.openIncomingModal = true;
  };

  showInProgressModal = () => {
    this.openCallInProgressModal = true;
  };

  handleCallAccept = async () => {
    console.log("Accept Call", this.incomingCall);

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
    this.openIncomingModal = false;
    this.openCallInProgressModal = true;
  };

  prepareCallInstance = (call?: Call | null): Call => {
    if (!call) {
      console.error("No call to prepare");
    }
    // let incomingCallCopy = _.cloneDeepWith(this.incomingCall, toRaw);
    // incomingCallCopy.on("accept", this.handleIncomingCallAccept);
    // incomingCallCopy.on("cancel", this.handleIncomingCallDisconnect);
    // incomingCallCopy.on("disconnect", this.handleIncomingCallDisconnect);
    // incomingCallCopy.on("reject", this.handleIncomingCallDisconnect);
    // return incomingCallCopy;
    return call as Call;
  };

  handleCallReject = async () => {
    console.log("Reject Call");
    const incomingCallCopy = this.prepareCallInstance(this.incomingCall);

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
    this.incomingCall = undefined;
    this.openCallInProgressModal = false;
  };

  handleCallDisconnect = () => {
    console.log("Disconnect Call");
    // const incomingCallCopy = this.prepareCallInstance(this.incomingCall);
    // this.incomingCallCopy?.reject();
    // this.incomingCallCopy?.disconnect();
    // this.incomingCallCopy = undefined;
    // this.openCallInProgressModal = false;
  };

  handleIncomingCall(call: Call) {
    call.on("accept", this.handleIncomingCallAccept);
    call.on("cancel", this.handleIncomingCallDisconnect);
    call.on("disconnect", this.handleIncomingCallDisconnect);
    call.on("reject", this.handleIncomingCallDisconnect);

    this.setCall(call);
  }

  handleIncomingCallDisconnect() {
    console.log("The call has been disconnected.");
  }
  handleIncomingCallAccept() {
    console.log("The call has been accepted.");
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
  }

  async initializeDevice(data: any) {
    const { token, identity } = data;

    this.device = new Device(token);

    this.device.on("tokenWillExpire", async () => {
      return await this.getAccessToken().then((data) =>
        this.device?.updateToken(data.data.token)
      );
    });

    this.device.on("registered", () => {
      this.status = "Online";
      console.log("The device is ready to receive incoming calls.");
    });

    this.device.on("destroyed", () => {
      console.log("destroyed");
    });

    this.device.on("error", (error) => {
      // Handle any errors with the Twilio Device
      console.error("Twilio Device error:", error);
      this.error = "Twilio Device error. See console for details.";
    });

    this.device.on("registering", () => {
      console.log("registering");
      this.status = "Registering...";
    });

    this.device.on("unregistered", () => {
      console.log("unregistered");
      this.status = "Disconnected";
    });

    this.device.on("connect", (connection) => {
      console.log("connect", connection);
    });

    this.device.on("disconnect", (connection) => {
      console.log("disconnect", connection);
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
    console.log("Incoming Call", call);
  };
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
