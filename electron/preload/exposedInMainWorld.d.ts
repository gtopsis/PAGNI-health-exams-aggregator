export interface IElectronAPI {
  parseHealthExams: (filesPatths: string[]) => Promise<void>;
  receiveFromD: (f: Function) => Promise<void>;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
