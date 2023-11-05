import { addHealthDataFromNewMedicalReports } from "./healthExamParser/PDFHealthDataExtractor";
import {
  FileDetails,
  ResultsForAllMedicalTestsFromAllFiles,
  MedicalTestResultFromFile,
  Results,
  UploadedFileMetadata,
} from "../../common/interfaces";

export const parseNewHealthExam = async (
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

export const removeAllHealthTermsResultsOfFile = (
  healthDataOfAllFiles: ResultsForAllMedicalTestsFromAllFiles,
  fileId: number
) => {
  healthDataOfAllFiles.forEach(
    (healthTermValues: MedicalTestResultFromFile[]) => {
      const index = healthTermValues.findIndex(
        (healthTermValueInFile) => healthTermValueInFile.fileId === fileId
      );

      if (index !== -1) {
        healthTermValues.splice(index, 1);
      }
    }
  );

  return healthDataOfAllFiles;
};

export const removeHealthExam = (totalHealthData: Results, fileId: number) => {
  const fileToBeRemovedIndex = totalHealthData.filesDetails.findIndex(
    (file) => file.id === fileId
  );
  if (fileToBeRemovedIndex === -1) {
    return;
  }

  const fileToBeRemovedId =
    totalHealthData.filesDetails[fileToBeRemovedIndex]?.fileId;
  if (!fileToBeRemovedId) {
    return;
  }
  totalHealthData.resultsForAllMedicalTestsFromAllFiles =
    removeAllHealthTermsResultsOfFile(
      totalHealthData.resultsForAllMedicalTestsFromAllFiles,
      fileToBeRemovedId
    );

  // remove the file from the list
  totalHealthData.filesDetails.splice(fileToBeRemovedIndex, 1);

  // if no processed files exist then remove all medical tests
  if (totalHealthData.filesDetails.length === 0) {
    totalHealthData.resultsForAllMedicalTestsFromAllFiles = new Map<
      string,
      MedicalTestResultFromFile[]
    >();
  }
};
