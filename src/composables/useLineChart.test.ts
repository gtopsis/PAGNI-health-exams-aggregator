import { describe, it, expect, vi } from "vitest";
import { ref, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

const chartInstances: any[] = [];
vi.mock("chart.js", () => {
  class MockChart {
    static register = vi.fn();
    config: any;
    data: any;
    destroyed = false;
    updated = 0;
    constructor(ctx: any, config: any) {
      this.config = config;
      this.data = config.data;
      chartInstances.push(this);
    }
    update() {
      this.updated += 1;
    }
    destroy() {
      this.destroyed = true;
    }
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

import { useLineChart } from "./useLineChart";
import type { LineGraphPoint } from "../domain/types";

function mountWithChart(points: LineGraphPoint[], label: string) {
  chartInstances.length = 0; // isolate each mount
  const pointsRef = ref(points);
  const labelRef = ref(label);

  const Comp = defineComponent({
    setup() {
      const canvas = useLineChart(pointsRef, labelRef);
      return () => h("canvas", { ref: canvas });
    },
  });

  const wrapper = mount(Comp);
  return { wrapper, pointsRef, labelRef };
}

describe("useLineChart", () => {
  it("creates a chart on mount with labels and values", () => {
    mountWithChart(
      [
        { date: "2023-04-05", value: 40.6 },
        { date: "2023-05-11", value: 49.1 },
      ],
      "HCT"
    );

    expect(chartInstances).toHaveLength(1);
    const chart = chartInstances[0];
    expect(chart.data.labels).toEqual(["2023-04-05", "2023-05-11"]);
    expect(chart.data.datasets[0].data).toEqual([40.6, 49.1]);
    expect(chart.data.datasets[0].label).toBe("HCT");
  });

  it("updates the chart when points change", async () => {
    const { pointsRef } = mountWithChart([{ date: "2023-04-05", value: 40.6 }], "HCT");
    const chart = chartInstances[0];

    pointsRef.value = [
      { date: "2023-04-05", value: 40.6 },
      { date: "2023-05-11", value: 49.1 },
    ];
    await nextTick();
    await nextTick();

    expect(chart.data.datasets[0].data).toEqual([40.6, 49.1]);
    expect(chart.updated).toBeGreaterThanOrEqual(1);
  });

  it("destroys the chart on unmount", async () => {
    const { wrapper } = mountWithChart([{ date: "2023-04-05", value: 1 }], "HCT");
    const chart = chartInstances[0];

    wrapper.unmount();
    await nextTick();

    expect(chart.destroyed).toBe(true);
  });

  it("uses an empty label for points without a date", () => {
    mountWithChart([{ date: undefined, value: 7 }], "HCT");
    expect(chartInstances[0].data.labels).toEqual([""]);
  });
});
