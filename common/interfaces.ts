export interface UploadedFileMetadata {
  path: string;
  name: string;
}

export interface FileDetails {
  path: string;
  name: string;
}

export interface MedicalReport extends FileDetails {
  id: number;
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
  medicalReports: MedicalReport[];
  resultsForAllMedicalTestsFromAllFiles: ResultsForAllMedicalTestsFromAllFiles;
}

export interface LineGraphPoint {
  date: string | undefined;
  value: number;
}
