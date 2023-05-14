export interface IElectronAPI {
  parseHealthExams: () => Promise<void>;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
