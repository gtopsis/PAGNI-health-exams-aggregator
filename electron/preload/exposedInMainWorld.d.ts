import type { Results, UploadedFileMetadata } from "../../common/interfaces";

export interface IElectronAPI {
  parseNewMedicalReports: (
    filesMetadata: UploadedFileMetadata[]
  ) => Promise<void>;
  receiveAggregatedHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  loadStoredHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  clearHealthData: () => void;
  removeFile: (medicalReportId: number) => boolean;
}

declare global {
  interface Window {
    medicalReportsParser: IElectronAPI;
  }
}
