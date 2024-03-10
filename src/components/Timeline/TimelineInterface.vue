<script lang="ts">
import { Moment } from "moment";

export type TimelineTypes =
  | "error"
  | "success"
  | "default"
  | "processing"
  | "warning";
export interface TimelineItem {
  date: Moment;
  message: string;
  type: TimelineTypes;
}
</script>
