<template>
  <WaitingCall />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import WaitingCall from "@/components/WaitingCall.vue"; // @ is an alias to /src

@Options({
  components: {
    WaitingCall,
  },
})
export default class ReadyView extends Vue {}
</script>
