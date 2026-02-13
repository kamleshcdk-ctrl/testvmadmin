import toLocalDate from "@/filters/localdate";
import toLocalTime from "@/filters/localtime";

export default function toLocalDateTime(value: string) {
  if (!value) {
    return "";
  }

  if (!value || value === "never") {
    return "Never";
  }

  const date = toLocalDate(value);
  const time = toLocalTime(value);

  return `${date} · ${time}`;
}
