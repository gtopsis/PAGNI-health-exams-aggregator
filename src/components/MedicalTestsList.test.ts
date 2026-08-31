import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MedicalTestsList from "./MedicalTestsList.vue";

const tests = [
  { code: "HCT", label: "HCT Αιματοκρίτης" },
  { code: "MCHC", label: "MCHC Μέση πυκνότητα" },
];

describe("MedicalTestsList", () => {
  it("renders one option per test with its display label", () => {
    const wrapper = mount(MedicalTestsList, {
      props: { tests, selected: "HCT" },
    });

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(wrapper.text()).toContain("HCT Αιματοκρίτης");
    expect(wrapper.text()).toContain("MCHC Μέση πυκνότητα");
  });

  it("checks the radio of the selected test", () => {
    const wrapper = mount(MedicalTestsList, {
      props: { tests, selected: "MCHC" },
    });

    const checked = wrapper.findAll('input[type="radio"]:checked');
    expect(checked).toHaveLength(1);
    expect(checked[0]!.attributes("value")).toBe("MCHC");
  });

  it("emits select with the test code when a radio is chosen", async () => {
    const wrapper = mount(MedicalTestsList, {
      props: { tests, selected: "HCT" },
    });

    await wrapper.findAll('input[type="radio"]')[1]!.setValue(true);

    expect(wrapper.emitted("select")).toEqual([["MCHC"]]);
  });

  it("shows an empty-state message when there are no tests", () => {
    const wrapper = mount(MedicalTestsList, {
      props: { tests: [], selected: undefined },
    });
    expect(wrapper.text()).toMatch(/no tests/i);
  });
});
