<template>
  <a-row>
    <a-col :span="12" :offset="6" class="center-content">
      <img alt="Vue logo" src="../assets/logo.png" />
      <a-typography-title level="3"> Welcome to InPhone </a-typography-title>
      <a-typography-paragraph> dev-challenge </a-typography-paragraph>
    </a-col>
  </a-row>
</template>

<style scoped>
.center-content {
  text-align: center;
  padding-top: 32px;
}
</style>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Options({
  components: {
    HelloWorld,
  },
})
export default class HomeView extends Vue {}
</script>
