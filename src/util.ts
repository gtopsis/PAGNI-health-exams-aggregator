import dayjs from "dayjs";

export const convertUStoStartDateFormat = (dateInUSFormat: string) => {
  const dateParts = dateInUSFormat.split("/");

  return dateParts.length != 3
    ? null
    : `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
};

export const compareDates = (date1: string, date2: string) => {
  return dayjs(date1).isValid() && dayjs(date2).isValid()
    ? new Date(date1).getTime() - new Date(date2).getTime()
    : null;
};
