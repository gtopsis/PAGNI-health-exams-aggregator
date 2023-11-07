import { addHealthDataFromNewMedicalReports } from "./medicalReportParser/PDFHealthDataExtractor";
import type {
  FileDetails,
  ResultsForAllMedicalTestsFromAllFiles,
  MedicalTestResultFromMedicalReport,
  Results,
  UploadedFileMetadata,
} from "../../common/interfaces";

export const parseNewMedicalReport = async (
  totalHealthData: Results,
  filesMetadata: UploadedFileMetadata[]
) => {
  // check if some files have already been processed
  const newFiles = filesMetadata.filter(
    ({ path }: { path: string }) =>
      !totalHealthData.filesDetails.find(
        (existingFile: FileDetails) => existingFile.path === path
      )
  );
  if (newFiles.length != filesMetadata.length) {
    console.warn("Tried to process a file which it has already been handled");
  }

  if (newFiles.length === 0) {
    return totalHealthData;
  }

  return addHealthDataFromNewMedicalReports(totalHealthData, newFiles);
};

export const removeAllMedicalTestsResultsOfFile = (
  healthDataOfAllFiles: ResultsForAllMedicalTestsFromAllFiles,
  medicalReportId: number
) => {
  healthDataOfAllFiles.forEach(
    (healthTermValues: MedicalTestResultFromMedicalReport[]) => {
      const index = healthTermValues.findIndex(
        (healthTermValueInFile) =>
          healthTermValueInFile.medicalReportId === medicalReportId
      );

      if (index == -1) {
        return;
      }
      healthTermValues.splice(index, 1);
    }
  );

  return healthDataOfAllFiles;
};

export const removeMedicalReport = (
  totalHealthData: Results,
  medicalReportId: number
) => {
  const fileToBeRemovedIndex = totalHealthData.filesDetails.findIndex(
    (file) => file.id === medicalReportId
  );

  if (fileToBeRemovedIndex === -1) {
    return;
  }

  const fileToBeRemovedId =
    totalHealthData.filesDetails[fileToBeRemovedIndex]?.id;

  if (fileToBeRemovedId === undefined || fileToBeRemovedId === null) {
    return;
  }

  totalHealthData.resultsForAllMedicalTestsFromAllFiles =
    removeAllMedicalTestsResultsOfFile(
      totalHealthData.resultsForAllMedicalTestsFromAllFiles,
      fileToBeRemovedId
    );

  // remove the file from the list
  totalHealthData.filesDetails.splice(fileToBeRemovedIndex, 1);

  // if no processed files exist then remove all medical tests
  if (totalHealthData.filesDetails.length === 0) {
    totalHealthData.resultsForAllMedicalTestsFromAllFiles = new Map<
      string,
      MedicalTestResultFromMedicalReport[]
    >();
  }
};
