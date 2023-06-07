<script setup lang="ts">
import { ComputedRef, computed, ref } from "vue";
import {
  Results,
  HealthTermValueInFile,
  FileDetails,
} from "../common/interfaces";
import HealthTermsList from "./components/HealthTermsList.vue";

import FileUpload from "./components/FileUpload.vue";
import LineGraph from "./components/LineGraph.vue";
import FilesList from "./components/FilesList.vue";
import TheAppBar from "./components/TheAppBar.vue";

let manuallyOpenedUploadArea = ref(true);
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

const isUploadAreaVisible = computed(
  () =>
    manuallyOpenedUploadArea.value || healthData.value.filesData.length === 0
);

const clearResults = () => window.healthExamsParser.clearHealthData();

const toggleUploadAreaVissibility = () =>
  (manuallyOpenedUploadArea.value = !manuallyOpenedUploadArea.value);

const changeActiveHealthTerm = (newActiveHealthTerm: string) => {
  activeHealthTerm.value = newActiveHealthTerm;
};
</script>

<template>
  <v-app id="app">
    <TheAppBar
      :number-of-files="healthData.filesData.length"
      @clear-results="clearResults"
      @toggle-upload-area-vissibility="toggleUploadAreaVissibility"
    ></TheAppBar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row class="pa-2">
          <Transition>
            <v-col
              sm="12"
              class="upload-file-area pa-2"
              v-if="isUploadAreaVisible"
            >
              <FileUpload :maxSize="5" accept="pdf" />
            </v-col>
          </Transition>

          <v-col md="3" sm="12" v-if="healthTerms.length > 0">
            <v-sheet rounded="lg" class="pa-2">
              <HealthTermsList
                :active="activeHealthTerm"
                :health-terms="healthTerms"
                @active-health-term-updated="changeActiveHealthTerm"
              ></HealthTermsList>
            </v-sheet>
          </v-col>

          <v-col md="9" sm="12">
            <v-sheet min-height="70vh" rounded="lg" class="pa-2">
              <LineGraph
                v-if="lineGraphdata.length"
                :graph-data="lineGraphdata"
                :label="activeHealthTerm"
              ></LineGraph>

              <FilesList v-else :files="healthData.filesData"></FilesList>
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

.upload-file-area {
  width: 100%;
  height: 350px;
  transition: all 0.25s ease;
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
