<script setup lang="ts">
import { Ref, ref } from "vue";
import { Results } from "../common/interfaces";
import FileUpload from "./components/FileUpload.vue";

let healthData: Ref<Results> = ref<Results | null>(null);

// Called when new health data calculated
window.healthExamsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    console.info(`Retrieved stored data`);
    console.info(data);

    healthData.value = data;
  }
);

// Called when new health data calculated
window.healthExamsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    console.info(`Received new data`);
    console.info(data);

    healthData.value = data;
  }
);

const clearResults = () => {
  window.healthExamsParser.clearHealthData();
};
</script>

<template>
  <h2>Health data Aggregator</h2>

  <FileUpload :maxSize="5" accept="pdf" />
  <div><button @click="clearResults">Remove results</button></div>

  <h3>Files</h3>
  <ul>
    <li v-for="file in healthData.filesData">
      <span>{{ file.filePath }}</span>
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

.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9feaf9);
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
