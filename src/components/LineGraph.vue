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
} from "chart.js";
import { Line } from "vue-chartjs";
import { compareDates, convertUStoStartDateFormat } from "../util";
import { number } from "yargs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface GraphData {
  date: string;
  value: number;
}

const props = defineProps({
  graphData: { type: Array as PropType<GraphData[]>, required: true },
  label: { type: String, required: true },
});

const { graphData, label } = toRefs(props);

const sortedGraphDataByDate = computed(() => {
  return graphData.value.sort(
    ({ date: date1 }: { date: string }, { date: date2 }: { date: string }) =>
      compareDates(date1, date2) ?? -1
  );
});
const groupedData = computed(() =>
  sortedGraphDataByDate.value.reduce(
    (acc: [string[], number[]], next: GraphData) => {
      const dateInStandartFormat = convertUStoStartDateFormat(next.date) || "";
      acc[0].push(dateInStandartFormat);
      acc[1].push(next.value);

      return acc;
    },
    [[], []]
  )
);
const data = computed(() => {
  return {
    labels: groupedData.value[0],
    datasets: [
      {
        data: groupedData.value[1],
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
        callback: (value: number) => `${value}%`,
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