<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Results,
  HealthTermValueInFile,
  FileDetails,
} from "../common/interfaces";
import HealthTermsList from "./components/HealthTermsList.vue";

import FileUpload from "./components/FileUpload.vue";
import LineGraph from "./components/LineGraph.vue";
import FilesList from "./components/FilesList.vue";
import { ComputedRef } from "vue";

let isUploadAreaVisible = ref(false);
let healthData = ref({
  filesData: new Array<FileDetails>(),
  healthDataOfAllFiles: new Map<string, HealthTermValueInFile[]>(),
});

const healthTerms: ComputedRef<string[]> = computed(() =>
  Array.from(healthData.value.healthDataOfAllFiles.keys()).sort()
);
const activeHealthTerm = ref(healthTerms.value?.[0]);

// Called when new health data calculated
window.healthExamsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    activeHealthTerm.value = healthTerms.value?.[0];
  }
);

// Called when new health data calculated
window.healthExamsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    activeHealthTerm.value = healthTerms.value?.[0];
  }
);

const lineGraphdata = computed(() => {
  const filesData = <Results["filesData"]>healthData.value.filesData;
  const healthTermValueInFile = <HealthTermValueInFile[]>(
    healthData.value.healthDataOfAllFiles?.get(activeHealthTerm.value)
  );

  const result =
    healthTermValueInFile?.map(
      ({ fileId, healthTermValue }: HealthTermValueInFile) => ({
        date: filesData.find(
          (fileData: FileDetails) => fileData.fileId === fileId
        )?.date,
        value: healthTermValue,
      })
    ) || [];

  return result;
});

const clearResults = () => window.healthExamsParser.clearHealthData();

const toggleUploadArea = () =>
  (isUploadAreaVisible.value = !isUploadAreaVisible.value);

const changeActiveHealthTerm = (newActiveHealthTerm: string) => {
  activeHealthTerm.value = newActiveHealthTerm;
};
</script>

<template>
  <v-app id="app">
    <v-app-bar>
      <v-toolbar-title>Health data Aggregator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="toggleUploadArea">
        <span>Upload health exam(s)</span>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <Transition>
          <v-row class="pa-2" v-if="isUploadAreaVisible">
            <v-col class="upload-file-area">
              <FileUpload :maxSize="5" accept="pdf" />
            </v-col>
          </v-row>
        </Transition>

        <v-row class="pa-2">
          <v-col class="pa-2" cols="3" sm="12">
            <v-sheet rounded="lg">
              <HealthTermsList
                v-if="healthTerms.length > 0"
                :active="activeHealthTerm"
                :health-terms="healthTerms"
                @active-health-term-updated="changeActiveHealthTerm"
              ></HealthTermsList>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet min-height="70vh" rounded="lg" class="pa-2">
              <LineGraph
                v-if="lineGraphdata.length"
                :graph-data="lineGraphdata"
                :label="activeHealthTerm"
              ></LineGraph>

              <div
                class="flex-center my-5"
                v-if="healthData.filesData.length !== 0"
              >
                <v-btn color="error" @click="clearResults">Clear results</v-btn>
              </div>

              <h3>Files</h3>
              <span v-if="healthData.filesData.length === 0">
                No files so far</span
              >

              <div v-else>
                <FilesList :files="healthData.filesData"></FilesList>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
#app {
  width: 100%;
  padding-left: 0;
  padding-right: 0;
}

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

.upload-file-area {
  width: 100%;
  height: 350px;
  transition: all 0.25s ease;
}

.health-terms-list {
  max-height: 400px;
  overflow-y: scroll;
}

.health-term-list-item__label:hover,
.health-term-list-item__radio-btn:hover {
  cursor: pointer;
}

/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
