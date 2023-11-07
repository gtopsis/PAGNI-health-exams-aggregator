import dayjs from "dayjs";
import type {
  FileDetails,
  LineGraphPoint,
  MedicalReport,
  MedicalTestResultFromMedicalReport,
} from "../common/interfaces";

export const convertUStoStartDateFormat = (dateInUSFormat: string) => {
  const dateParts = dateInUSFormat.split("/");

  return dateParts.length != 3
    ? null
    : `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
};

export const compareDates = (
  date1: string | undefined,
  date2: string | undefined
) => {
  return date1 && date2 && dayjs(date1).isValid() && dayjs(date2).isValid()
    ? new Date(date1).getTime() - new Date(date2).getTime()
    : null;
};

export const getDateOfMedicalReportWithId = (
  filesDetailsList: MedicalReport[],
  medicalReportId: number
) => {
  return filesDetailsList.find(
    ({ id }: MedicalReport) => id === medicalReportId
  )?.date;
};

export const getLineGraphPointFromMedicalTestResult = (
  medicalTestResults: MedicalTestResultFromMedicalReport[],
  filesDetailsList: MedicalReport[]
): LineGraphPoint[] => {
  return medicalTestResults?.map(
    ({
      medicalReportId,
      medicalTestResult,
    }: MedicalTestResultFromMedicalReport): LineGraphPoint => ({
      date: getDateOfMedicalReportWithId(filesDetailsList, medicalReportId),
      value: medicalTestResult,
    })
  );
};
