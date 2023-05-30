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

const removeFile = (filePath: string) =>
  window.healthExamsParser.removeFile(filePath);
</script>

<template>
  <v-app id="inspire">
    <v-app-bar>
      <v-toolbar-title>Health data Aggregator</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <!--  -->

      <LineGraph
        v-if="data.length"
        :graph-data="data"
        :label="graphTitle"
      ></LineGraph>

      <div class="flex-center" v-if="healthData.filesData.length !== 0">
        <v-btn color="error" @click="clearResults">Clear results</v-btn>
      </div>

      <h3>Files</h3>
      <span v-if="healthData.filesData.length === 0"> No files so far</span>

      <div v-else>
        <div v-for="file in healthData.filesData" class="files-list-item">
          <div class="files-list-item_description">
            <small>{{ file.filePath }}</small>
          </div>
          <div class="files-list-item_action">
            <v-btn color="error" @click="removeFile(file.filePath)"
              >Remove</v-btn
            >
          </div>
        </div>
      </div>

      <FileUpload :maxSize="5" accept="pdf" />
    </v-main>
  </v-app>
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

.files-list-item {
  display: flex;
  justify-content: space-between;
}

.files-list-item_description {
  max-width: 75%;
}

.files-list-item_action {
  /* width: 20%; */
}
</style>
