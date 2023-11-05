<script setup lang="ts">
import { PropType, computed, toRefs } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ChartData,
} from "chart.js";
import { Line } from "vue-chartjs";
import { compareDates, convertUStoStartDateFormat } from "../util";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface LinePoint {
  date: string | undefined;
  value: number;
}

const props = defineProps({
  graphData: { type: Array as PropType<LinePoint[]>, required: true },
  label: { type: String, required: true },
});
const { graphData, label } = toRefs(props);

const sortedGraphDataByDate = computed(() => {
  return graphData.value.sort(
    (
      { date: date1 }: { date: string | undefined },
      { date: date2 }: { date: string | undefined }
    ) => compareDates(date1, date2) ?? -1
  );
});
const groupedData = computed(() =>
  sortedGraphDataByDate.value.reduce(
    (acc: [(string | null)[], number[]], next: LinePoint) => {
      const dateInStandartFormat = next.date
        ? convertUStoStartDateFormat(next.date)
        : "";

      const [xAxisData, yAxisData] = acc;
      xAxisData.push(dateInStandartFormat);
      yAxisData.push(next.value);

      return acc;
    },
    [[], []]
  )
);

const data = computed((): ChartData<"line"> => {
  const [xAxisData, yAxisData] = groupedData.value;
  return {
    labels: xAxisData,
    datasets: [
      {
        data: yAxisData,
        label: label.value,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.2,
      },
    ],
  };
});

const options = {
  responsive: true,
  elements: {
    point: {
      radius: 4,
      hoverRadius: 5,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "Value",
        font: {
          size: 15,
        },
      },
      ticks: {
        callback: (value: number | string) => `${value}`,
      },
    },
    x: {
      title: {
        display: true,
        text: "Date",
        font: {
          size: 15,
        },
      },
    },
  },
};
</script>

<template>
  <Line :data="data" :options="options" />
</template>
