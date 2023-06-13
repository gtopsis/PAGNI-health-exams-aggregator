export interface FileDetails {
  fileId: number;
  filePath: string;
  // we have define undefined cause exactOptionalPropertyTypes = ✅true
  date?: string | undefined;
}

export interface HealthTermValueInFile {
  fileId: number;
  healthTermValue: number;
}

export type HealthTermsValues = Map<string, HealthTermValueInFile[]>;

export interface Results {
  filesMetadata: FileDetails[];
  healthTermsValues: HealthTermsValues;
}
