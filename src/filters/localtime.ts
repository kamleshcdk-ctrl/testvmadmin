import moment from "moment";

export default function toLocalTime(value: string) {
  return moment(value).format("h:mm A");
}
