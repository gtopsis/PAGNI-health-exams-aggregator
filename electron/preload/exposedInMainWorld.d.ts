export interface IElectronAPI {
  parseHealthExams: (filesPatths: string[]) => Promise<void>;
  receiveAggregatedHealtData: (
    callback: (event: Event, ...args: unknown[]) => void
  ) => Promise<void>;
  loadStoredHealtData: (
    callback: (event: Event, ...args: unknown[]) => void
  ) => Promise<void>;
  clearHealthData: () => void;
}

declare global {
  interface Window {
    healthExamsParser: IElectronAPI;
  }
}
