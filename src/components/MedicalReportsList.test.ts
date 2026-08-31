import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MedicalReportsList from "./MedicalReportsList.vue";
import type { MedicalReport } from "../domain/types";

const reports: MedicalReport[] = [
  { id: "r1", path: "/tmp/a.pdf", name: "a.pdf", date: "2023-04-05", measurements: [] },
  { id: "r2", path: "/tmp/b.pdf", name: "b.pdf", measurements: [] },
];

describe("MedicalReportsList", () => {
  it("renders one row per report with name and date", () => {
    const wrapper = mount(MedicalReportsList, { props: { reports } });

    expect(wrapper.text()).toContain("a.pdf");
    expect(wrapper.text()).toContain("2023-04-05");
    expect(wrapper.text()).toContain("b.pdf");
    expect(wrapper.findAll('[data-testid="report-row"]')).toHaveLength(2);
  });

  it("shows a placeholder when a report has no parsed date", () => {
    const wrapper = mount(MedicalReportsList, { props: { reports } });
    const rows = wrapper.findAll('[data-testid="report-row"]');
    expect(rows[1]!.text()).toMatch(/unknown date/i);
  });

  it("emits remove with the report id when its delete button is clicked", async () => {
    const wrapper = mount(MedicalReportsList, { props: { reports } });

    await wrapper.findAll('[data-testid="remove-report"]')[0]!.trigger("click");

    expect(wrapper.emitted("remove")).toEqual([["r1"]]);
  });

  it("shows an empty-state message when there are no reports", () => {
    const wrapper = mount(MedicalReportsList, { props: { reports: [] } });
    expect(wrapper.text()).toMatch(/no reports/i);
  });
});
