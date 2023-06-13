import { addHealthDataFromNewHealthExams } from "./healthExamParser/PDFHealthDataExtractor";
import {
  FileDetails,
  HealthTermsValues,
  HealthTermValueInFile,
  Results,
} from "../../common/interfaces";

export const parseNewHealthExam = async (
  totalHealthData: Results,
  filesPaths: string[]
) => {
  // check if some files have already been processed
  const newFilePaths = filesPaths.filter(
    (filePath: string) =>
      !totalHealthData.filesMetadata.find(
        (existingFile: FileDetails) => existingFile.filePath === filePath
      )
  );
  if (newFilePaths.length != filesPaths.length) {
    console.warn("Tried to process a file which it has already been handled");
  }

  if (newFilePaths.length === 0) {
    return totalHealthData;
  }

  return addHealthDataFromNewHealthExams(totalHealthData, newFilePaths);
};

export const removeAllHealthTermsResultsForFile = (
  healthDataOfAllFiles: HealthTermsValues,
  fileId: number
) => {
  healthDataOfAllFiles.forEach((value: HealthTermValueInFile[]) => {
    const index = value.findIndex(
      (healthTermValueInFile) => healthTermValueInFile.fileId === fileId
    );

    if (index !== -1) {
      value.splice(index, 1);
    }
  });

  return healthDataOfAllFiles;
};

export const removeHealthExam = (
  totalHealthData: Results,
  filePath: string
) => {
  const fileToBeRemovedIndex = totalHealthData.filesMetadata.findIndex(
    (file) => file.filePath === filePath
  );
  if (fileToBeRemovedIndex === -1) {
    return;
  }

  const fileToBeRemovedId =
    totalHealthData.filesMetadata[fileToBeRemovedIndex]?.fileId;
  if (!fileToBeRemovedId) {
    return;
  }

  totalHealthData.healthTermsValues = removeAllHealthTermsResultsForFile(
    totalHealthData.healthTermsValues,
    fileToBeRemovedId
  );

  // remove the file from the list
  totalHealthData.filesMetadata.splice(fileToBeRemovedIndex, 1);

  // if no processed files exist then remove all health terms
  if (totalHealthData.filesMetadata.length === 0) {
    totalHealthData.healthTermsValues = new Map<
      string,
      HealthTermValueInFile[]
    >();
  }
};
