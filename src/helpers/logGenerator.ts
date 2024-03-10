import moment from "moment";
import { TimelineTypes } from "@/components/Timeline/TimelineInterface.vue";

export const log = (message: string, type: TimelineTypes, data = null) => {
  console.log(message);
  return {
    message,
    type,
    data: data || moment(),
  };
};
