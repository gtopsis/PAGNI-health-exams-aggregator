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

const formattedGraphData = computed(() =>
  graphData.value.map((d) => {
    const dateParts = d.date.split("/");
    const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;

    return {
      date: formattedDate,
      value: d.value,
    };
  })
);
const sortedGraphDataByDate = computed(() => {
  return formattedGraphData.value.sort(
    ({ date: date1 }: { date: string }, { date: date2 }: { date: string }) =>
      new Date(date1).getDate() - new Date(date2).getDate()
  );
});
const data = computed(() => {
  return {
    labels: sortedGraphDataByDate.value.map((d) => d.date),
    datasets: [
      {
        data: sortedGraphDataByDate.value.map((d) => d.value),
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
