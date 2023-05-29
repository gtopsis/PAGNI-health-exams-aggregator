<script setup lang="ts">
import { Ref, computed, ref } from "vue";
import {
  Results,
  HealthTermValueInFile,
  FileDetails,
} from "../common/interfaces";
import FileUpload from "./components/FileUpload.vue";
import LineGraph from "./components/LineGraph.vue";

let healthData: Ref<Results> = ref<Results | null>({
  filesData: [],
  healthDataOfAllFiles: new Map(),
});

// Called when new health data calculated
window.healthExamsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    // console.debug(data);

    healthData.value = data;
  }
);

// Called when new health data calculated
window.healthExamsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
  }
);

const clearResults = () => window.healthExamsParser.clearHealthData();

const graphTitle = "HCT Αιματοκρίτης";

const data = computed(() => {
  const filesData = <Results["filesData"]>healthData.value.filesData;
  const healthTermValueInFile = <HealthTermValueInFile[]>(
    healthData.value.healthDataOfAllFiles?.get("HCT Αιματοκρίτης")
  );

  const result =
    healthTermValueInFile?.map(
      ({
        fileId,
        healthTermValue,
      }: {
        fileId: string;
        healthTermValue: number;
      }) => {
        return {
          date: filesData.find(
            (fileData: FileDetails) => fileData.fileId === fileId
          ).date,
          value: healthTermValue,
        };
      }
    ) || [];

  return result;
});
</script>

<template>
  <h2>Health data Aggregator</h2>

  <LineGraph
    v-if="data.length"
    :graph-data="data"
    :label="graphTitle"
  ></LineGraph>

  <div class="flex-center">
    <button @click="clearResults">Clear results</button>
  </div>

  <FileUpload :maxSize="5" accept="pdf" />

  <h3>Files</h3>
  <ul>
    <li v-for="file in healthData.filesData">
      <small>{{ file.filePath }}</small>
    </li>
  </ul>
</template>

<style>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
</style>
