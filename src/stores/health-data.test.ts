import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../api/tauri-api", () => ({
  loadInitial: vi.fn(),
  parseReports: vi.fn(),
  removeReport: vi.fn(),
  clearAll: vi.fn(),
}));

import * as api from "../api/tauri-api";
import { useHealthDataStore } from "./health-data";
import type { HealthData } from "../domain/types";

const sampleData: HealthData = {
  reports: [
    {
      id: "r1",
      path: "a.pdf",
      name: "a.pdf",
      date: "2023-05-11",
      measurements: [["HCT", { value: 49.1, unit: "%" }]],
    },
    {
      id: "r2",
      path: "b.pdf",
      name: "b.pdf",
      date: "2023-04-05",
      measurements: [
        ["HCT", { value: 40.6, unit: "%" }],
        ["MCHC", { value: 25.9, unit: "g/dl" }],
      ],
    },
  ],
};

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("health-data store", () => {
  it("starts empty with the upload area visible", () => {
    const store = useHealthDataStore();
    expect(store.isEmpty).toBe(true);
    expect(store.isUploadAreaVisible).toBe(true);
    expect(store.availableTestCodes).toEqual([]);
  });

  it("loadInitial applies data and selects the first test", async () => {
    vi.mocked(api.loadInitial).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();

    await store.loadInitial();

    expect(store.reports).toHaveLength(2);
    expect(store.availableTestCodes).toEqual(["HCT", "MCHC"]);
    expect(store.selectedTestCode).toBe("HCT");
  });

  it("parseReports ignores an empty selection", async () => {
    const store = useHealthDataStore();
    await store.parseReports([]);
    expect(api.parseReports).not.toHaveBeenCalled();
  });

  it("parseReports applies returned data", async () => {
    vi.mocked(api.parseReports).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();

    await store.parseReports(["a.pdf", "b.pdf"]);

    expect(api.parseReports).toHaveBeenCalledWith(["a.pdf", "b.pdf"]);
    expect(store.isEmpty).toBe(false);
  });

  it("lineGraphPoints exposes sorted points for the selected test", async () => {
    vi.mocked(api.loadInitial).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();
    await store.loadInitial();
    store.selectTest("HCT");

    expect(store.lineGraphPoints).toEqual([
      { date: "2023-04-05", value: 40.6 },
      { date: "2023-05-11", value: 49.1 },
    ]);
    expect(store.isLineGraphVisible).toBe(true);
  });

  it("removeReport falls back to the first available test if selection vanished", async () => {
    vi.mocked(api.loadInitial).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();
    await store.loadInitial();
    store.selectTest("MCHC");

    const afterRemoval: HealthData = {
      reports: [sampleData.reports[0]!], // only HCT remains
    };
    vi.mocked(api.removeReport).mockResolvedValueOnce(afterRemoval);

    await store.removeReport("r2");

    expect(store.selectedTestCode).toBe("HCT");
  });

  it("clearAll empties state", async () => {
    vi.mocked(api.loadInitial).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();
    await store.loadInitial();

    vi.mocked(api.clearAll).mockResolvedValueOnce({ reports: [] });
    await store.clearAll();

    expect(store.isEmpty).toBe(true);
    expect(store.selectedTestCode).toBeUndefined();
  });

  it("toggleUploadArea flips visibility while data exists", async () => {
    vi.mocked(api.loadInitial).mockResolvedValueOnce(sampleData);
    const store = useHealthDataStore();
    await store.loadInitial();

    store.toggleUploadArea();
    expect(store.isUploadAreaVisible).toBe(false);
    store.toggleUploadArea();
    expect(store.isUploadAreaVisible).toBe(true);
  });
});
