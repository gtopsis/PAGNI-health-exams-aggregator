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
});

const { graphData } = toRefs(props);

const convertUStoStartDateFormat = (dateInUSFormat: string) => {
  const dateParts = dateInUSFormat.split("/");

  return dateParts.length != 3
    ? null
    : `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
};

const sortedGraphDataByDate = computed(() => {
  return graphData.value.sort(
    ({ date: date1 }: { date: string }, { date: date2 }: { date: string }) =>
      new Date(date1).getDate() - new Date(date2).getDate()
  );
});
const formattedGraphData = computed(() =>
  sortedGraphDataByDate.value.reduce(
    (acc: { dates: string[]; values: number[] }, next: GraphData) => {
      const dateInStandartFormat = convertUStoStartDateFormat(next.date) || "";
      acc.dates.push(dateInStandartFormat);
      acc.values.push(next.value);

      return acc;
    },
    { dates: [], values: [] }
  )
);
const data = computed(() => {
  return {
    labels: formattedGraphData.value.dates,
    datasets: [
      {
        data: formattedGraphData.value.values,
        label: "My First Dataset",
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
});

const options = {
  responsive: true,
};
</script>

<template>
  <Line :data="data" :options="options" />
</template>
