import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";
import type { LineGraphPoint } from "../domain/types";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

function buildData(points: LineGraphPoint[], label: string): ChartData<"line"> {
  return {
    labels: points.map((p) => p.date ?? ""),
    datasets: [
      {
        label,
        data: points.map((p) => p.value),
        fill: false,
        borderColor: "rgb(13, 148, 136)",
        tension: 0.2,
      },
    ],
  };
}

/**
 * Owns the lifecycle of a Chart.js line chart bound to a `<canvas>`.
 * Returns a template ref to attach to the canvas element.
 */
export function useLineChart(
  points: Ref<LineGraphPoint[]>,
  label: Ref<string>
): Ref<HTMLCanvasElement | null> {
  const canvas = ref<HTMLCanvasElement | null>(null);
  let chart: Chart<"line"> | null = null;

  onMounted(() => {
    if (!canvas.value) return;
    chart = new Chart(canvas.value, {
      type: "line",
      data: buildData(points.value, label.value),
      options: {
        responsive: true,
        elements: { point: { radius: 4, hoverRadius: 5 } },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Value" } },
        },
      },
    });
  });

  watch([points, label], () => {
    if (!chart) return;
    chart.data = buildData(points.value, label.value);
    chart.update();
  });

  onBeforeUnmount(() => {
    chart?.destroy();
    chart = null;
  });

  return canvas;
}
