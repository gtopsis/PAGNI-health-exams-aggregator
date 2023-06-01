import { Results } from "../../common/interfaces";

export interface IElectronAPI {
  parseHealthExams: (filesPatths: string[]) => Promise<void>;
  receiveAggregatedHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  loadStoredHealtData: (
    callback: (event: Event, data: Results) => void
  ) => Promise<void>;
  clearHealthData: () => void;
  removeFile: (filePath: string) => boolean;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
