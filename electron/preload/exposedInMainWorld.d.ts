import { Results, UploadedFileMetadata } from "../../common/interfaces";

export interface IElectronAPI {
  parseHealthExams: (filesMetadata: UploadedFileMetadata[]) => Promise<void>;
  receiveAggregatedHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  loadStoredHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  clearHealthData: () => void;
  removeFile: (fileId: number) => boolean;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
