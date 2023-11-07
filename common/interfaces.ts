export interface UploadedFileMetadata {
  path: string;
  name: string;
}

export interface FileDetails {
  id: number;
  path: string;
  name: string;
  // we have define undefined cause exactOptionalPropertyTypes = ✅true
  date?: string | undefined;
}

export interface MedicalTestResultFromMedicalReport {
  medicalReportId: number;
  medicalTestResult: number;
}

export type ResultsForAllMedicalTestsFromAllFiles = Map<
  string,
  MedicalTestResultFromMedicalReport[]
>;

export interface Results {
  filesDetails: FileDetails[];
  resultsForAllMedicalTestsFromAllFiles: ResultsForAllMedicalTestsFromAllFiles;
}

export interface LineGraphPoint {
  date: string | undefined;
  value: number;
}
