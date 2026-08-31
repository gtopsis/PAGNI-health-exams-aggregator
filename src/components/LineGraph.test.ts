import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("chart.js", () => {
  class MockChart {
    static register = vi.fn();
    constructor() {}
    update() {}
    destroy() {}
  }
  return {
    Chart: MockChart,
    register: vi.fn(),
    LineController: {},
    LineElement: {},
    PointElement: {},
    LinearScale: {},
    CategoryScale: {},
    Title: {},
    Tooltip: {},
    Legend: {},
  };
});

import LineGraph from "./LineGraph.vue";

describe("LineGraph", () => {
  it("renders a canvas for the chart", () => {
    const wrapper = mount(LineGraph, {
      props: {
        points: [{ date: "2023-04-05", value: 40.6 }],
        label: "HCT",
      },
    });

    expect(wrapper.find('[data-testid="line-graph"]').exists()).toBe(true);
  });
});
