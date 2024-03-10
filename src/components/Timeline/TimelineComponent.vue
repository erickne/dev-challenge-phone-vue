<template>
  <a-space direction="vertical" class="left-aligned-items">
    <span v-for="(item, index) in timelineData" :key="index">
      <a-badge :status="item.type || 'default'" :text="format(item)" />
    </span>
  </a-space>
</template>

<style scoped>
.left-aligned-items .ant-space-item {
  text-align: left !important;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { TimelineItem } from "@/components/Timeline/TimelineInterface.vue";

function format(item: TimelineItem): string {
  return item.date.format("YYYY-MM-DD HH:mm:ss") + " " + item.message;
}
export default defineComponent({
  name: "TimelineComponent",
  props: {
    timelineData: {
      type: Array as () => TimelineItem[],
      required: true,
    },
  },
  methods: {
    format,
  },
});
</script>
