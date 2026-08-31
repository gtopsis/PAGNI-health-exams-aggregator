import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
import { parseReports, removeReport, clearAll, loadInitial } from "./tauri-api";

const invokeMock = vi.mocked(invoke);

const wireHealthData = {
  reports: [
    {
      id: "r1",
      path: "a.pdf",
      name: "a.pdf",
      date: "2023-04-05",
      measurements: [
        ["HCT", { value: 40.6, unit: "%", ref_range: { min: 40, max: 52 } }],
      ],
    },
    {
      id: "r2",
      path: "b.pdf",
      name: "b.pdf",
      measurements: [],
    },
  ],
};

beforeEach(() => {
  invokeMock.mockReset();
});

describe("tauri-api", () => {
  it("parseReports invokes the command and maps snake_case to camelCase", async () => {
    invokeMock.mockResolvedValueOnce(wireHealthData);

    const data = await parseReports(["a.pdf"]);

    expect(invokeMock).toHaveBeenCalledWith("parse_reports", {
      paths: ["a.pdf"],
    });
    expect(data.reports[0]?.measurements[0]?.[1]).toEqual({
      value: 40.6,
      unit: "%",
      refRange: { min: 40, max: 52 },
    });
    expect(data.reports[1]?.date).toBeUndefined();
  });

  it("removeReport passes the report id", async () => {
    invokeMock.mockResolvedValueOnce({ reports: [] });
    await removeReport("r1");
    expect(invokeMock).toHaveBeenCalledWith("remove_report", {
      reportId: "r1",
    });
  });

  it("clearAll invokes clear_all", async () => {
    invokeMock.mockResolvedValueOnce({ reports: [] });
    const data = await clearAll();
    expect(invokeMock).toHaveBeenCalledWith("clear_all");
    expect(data.reports).toEqual([]);
  });

  it("loadInitial invokes load_initial", async () => {
    invokeMock.mockResolvedValueOnce(wireHealthData);
    const data = await loadInitial();
    expect(invokeMock).toHaveBeenCalledWith("load_initial");
    expect(data.reports).toHaveLength(2);
  });

  it("rejects malformed payloads from the backend", async () => {
    invokeMock.mockResolvedValueOnce({ reports: "not-an-array" });
    await expect(loadInitial()).rejects.toThrow();
  });
});
