import { addHealthDataFromNewHealthExams } from "./healthExamParser/PDFHealthDataExtractor";
import {
  FilesResults,
  HealthTermValueInFile,
  Results,
} from "../../common/interfaces";

export const parseNewHealthExam = async (
  totalHealthData: Results,
  filesPaths: string[]
) => {
  // check if some files have already been processed
  const newFilePaths = filesPaths.filter(
    (filePath) =>
      !totalHealthData.filesData.find(
        (existingFile) => existingFile.filePath === filePath
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
  healthDataOfAllFiles: FilesResults,
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
  const fileToBeRemovedIndex = totalHealthData.filesData.findIndex(
    (file) => file.filePath === filePath
  );
  if (fileToBeRemovedIndex === -1) {
    return;
  }

  const fileToBeRemovedId =
    totalHealthData.filesData[fileToBeRemovedIndex]?.fileId;
  if (!fileToBeRemovedId) {
    return;
  }

  totalHealthData.healthDataOfAllFiles = removeAllHealthTermsResultsForFile(
    totalHealthData.healthDataOfAllFiles,
    fileToBeRemovedId
  );

  // remove the file from the list
  totalHealthData.filesData.splice(fileToBeRemovedIndex, 1);

  // if no processed files exist then remove all health terms
  if (totalHealthData.filesData.length === 0) {
    totalHealthData.healthDataOfAllFiles = new Map<
      string,
      HealthTermValueInFile[]
    >();
  }
};
