<script setup lang="ts">
import { toRef } from "vue";
import type { LineGraphPoint } from "../domain/types";
import { useLineChart } from "../composables/useLineChart";

const props = defineProps<{
  points: LineGraphPoint[];
  label: string;
}>();

const canvas = useLineChart(toRef(props, "points"), toRef(props, "label"));
</script>

<template>
  <div class="relative h-full w-full">
    <canvas ref="canvas" data-testid="line-graph" />
  </div>
</template>
