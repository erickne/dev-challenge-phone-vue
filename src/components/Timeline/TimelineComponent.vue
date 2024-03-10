<template>
  <a-space direction="vertical" class="left-aligned-items">
    <span v-for="(item, index) in reversedTimelineData" :key="index">
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
import { defineComponent, watch, computed } from "vue";
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
  setup(props) {
    watch(
      () => props.timelineData,
      () => {
        // This function will run whenever `timelineData` changes
        console.log("timelineData has changed", props.timelineData);
      }
    );

    const reversedTimelineData = computed(() =>
      [...props.timelineData].reverse()
    );

    return {
      reversedTimelineData,
    };
  },
});
</script>
