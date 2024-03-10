<template>
  <HistoryCall />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import WaitingCall from "@/components/WaitingCall.vue";
import HistoryCall from "@/components/HistoryCall.vue"; // @ is an alias to /src

@Options({
  components: {
    HistoryCall,
  },
})
export default class HistoryView extends Vue {}
</script>
