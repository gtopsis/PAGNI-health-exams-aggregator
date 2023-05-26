<script setup lang="ts">
import * as d3 from "d3";
import { PropType, onMounted, toRefs, watchEffect } from "vue";
import dayjs from "dayjs";

interface GraphData {
  date: string;
  value: number;
}

const props = defineProps({
  graphData: { type: Array as PropType<GraphData[]>, required: true },
});

const { graphData } = toRefs(props);

// Parse the dates
const parseTime = d3.timeParse("%d-%b-%y");

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const width = 500 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

onMounted(() => {
  // // append the svg object to the body of the page
  const svg = d3
    .select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    // Add X axis --> it is a date format
    const x = d3
      .scaleTime()
      .domain(
        <[Date, Date]>d3.extent(
          graphData.value,
          ({ date }: { date: string }) => {
            const dateParts = date.split("/");
            const formattedDate = `${dateParts?.[1]}/${dateParts?.[0]}/${dateParts?.[2]}`;
            return new Date(date);
            // parseTime(date)
          }
        )
      )
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain(
        <[number, number]>(
          d3.extent(graphData.value, ({ value }: { value: number }) => value)
        )
      )
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const line = d3
      .line<GraphData>()
      .x(({ date }: { date: string }) => x(new Date(date)))
      .y(({ value }: { value: number }) => y(value))
      .curve(d3.curveBasis);

    // Add the line
    svg
      .append("path")
      .datum(graphData.value)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  });
});
</script>

<template>
  <div>
    <svg></svg>
  </div>
</template>

<style scoped></style>
