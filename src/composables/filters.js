import dayjs from "dayjs";

export const useLocalDate = () => {
  return {
    format: (date) => {
      return dayjs(date).format("YYYY-MM-DD");
    },
  };
};

export const useLocalDateTime = () => {
  return {
    format: (date) => {
      return dayjs(date).format("YYYY-MM-DD HH:mm");
    },
  };
};
