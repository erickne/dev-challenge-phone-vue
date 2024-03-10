<template>
  <a-row justify="left">
    <a-col :span="12" :offset="6">
      <a-row>
        <a-descriptions
          v-for="(call, index) in calls"
          :key="index"
          :title="'Call SID: ' + call.CallSid"
          size="small"
          class="call-description"
        >
          <a-descriptions-item label="Date" :span="2">
            {{ formatDate(call.created_at) }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            {{ call.CallStatus }}
          </a-descriptions-item>
          <a-descriptions-item label="Telephone">
            {{ call.Called }}
          </a-descriptions-item>
          <a-descriptions-item label="VoiceMail" v-if="call.RecordingUrl">
            <a :href="call?.RecordingUrl"
              >Listen - {{ call.RecordingDuration }} secs</a
            >
          </a-descriptions-item>
        </a-descriptions>
      </a-row>
    </a-col>
  </a-row>
</template>

<style scoped>
.call-description {
  padding-bottom: 32px;
}
</style>
<script lang="ts">
/* eslint-disable */
import { Vue } from "vue-class-component";
import axios from "axios";
import moment from "moment";

interface CallInterface {
  id: number;
  CallSid: string;
  CallStatus: string;
  Called: string;
  RecordingUrl?: string;
  RecordingDuration?: string;
  created_at: string;
}

export default class HistoryCall extends Vue {
  calls: CallInterface[] = [];

  /* eslint-disable */
  async getCallList() {
    const url = `http://127.0.0.1:8000/api/calls`;
    const { data } = await axios.get(url);
    this.calls = data;
  }

  formatDate(value: string) {
    if (value) {
      return moment(String(value)).format("MM/DD/YYYY HH:mm:ss");
    }
  }

  mounted() {
    this.getCallList();
  }
}
</script>
