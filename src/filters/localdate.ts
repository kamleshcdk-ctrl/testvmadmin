import moment from "moment-timezone";
// import store from "../store";

export default function toLocalDate(value: string, real = false) {
  if (value) {
    const momentValue = moment(value);

    if (!real && momentValue.isSame(moment(), "day")) {
      return "Today";
    }

    const yesterday = moment().subtract("1", "day");
    if (!real && momentValue.isSame(yesterday, "day")) {
      return "Yesterday";
    }

    const dateFormat = "M/DD/YYYY";
    return momentValue.format(dateFormat);
  }
}
