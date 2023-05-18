export interface IElectronAPI {
  parseHealthExams: () => Promise<void>;
  receiveFromD: (f: Function) => Promise<void>;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
