export interface FileDetails {
  fileId: number;
  filePath: string;
  // we have define undefined cause exactOptionalPropertyTypes = ✅true
  date?: string | undefined;
}

interface HealthTermValueInFile {
  fileId: number;
  healthTermValue: number;
}

export type FilesResults = Map<string, HealthTermValueInFile[]>;

export interface Results {
  filesData: FileDetails[];
  healthDataOfAllFiles: FilesResults;
}
