import { addHealthDataFromNewHealthExams } from "./healthExamParser/PDFHealthDataExtractor";
import {
  FileDetails,
  HealthTermsValues,
  HealthTermValueInFile,
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
        (existingFile: FileDetails) => existingFile.filePath === path
      )
  );
  if (newFiles.length != filesMetadata.length) {
    console.warn("Tried to process a file which it has already been handled");
  }

  if (newFiles.length === 0) {
    return totalHealthData;
  }

  return addHealthDataFromNewHealthExams(totalHealthData, newFiles);
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
  const fileToBeRemovedIndex = totalHealthData.filesDetails.findIndex(
    (file) => file.filePath === filePath
  );
  if (fileToBeRemovedIndex === -1) {
    return;
  }

  const fileToBeRemovedId =
    totalHealthData.filesDetails[fileToBeRemovedIndex]?.fileId;
  if (!fileToBeRemovedId) {
    return;
  }

  totalHealthData.healthTermsValues = removeAllHealthTermsResultsForFile(
    totalHealthData.healthTermsValues,
    fileToBeRemovedId
  );

  // remove the file from the list
  totalHealthData.filesDetails.splice(fileToBeRemovedIndex, 1);

  // if no processed files exist then remove all health terms
  if (totalHealthData.filesDetails.length === 0) {
    totalHealthData.healthTermsValues = new Map<
      string,
      HealthTermValueInFile[]
    >();
  }
};
