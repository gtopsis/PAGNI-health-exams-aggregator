<script setup lang="ts">
import { ComputedRef, computed, ref } from "vue";
import {
  Results,
  HealthTermValueInFile,
  FileDetails,
} from "../common/interfaces";
import HealthTermsList from "./components/HealthTermsList.vue";

import FilesUpload from "./components/FilesUpload.vue";
import LineGraph from "./components/LineGraph.vue";
import FilesList from "./components/FilesList.vue";

let manuallyOpenedUploadArea = ref(true);
let healthData = ref<Results>({
  filesDetails: new Array<FileDetails>(),
  healthTermsValues: new Map<string, HealthTermValueInFile[]>(),
});

const healthTerms: ComputedRef<string[]> = computed(() =>
  Array.from(healthData.value.healthTermsValues.keys()).sort()
);
const selectedHealthTerm = ref(healthTerms.value?.[0]);

// Called when new health data calculated
window.healthExamsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedHealthTerm.value = healthTerms.value?.[0];
  }
);

// Called when new health data calculated
window.healthExamsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedHealthTerm.value = healthTerms.value?.[0];
  }
);

const lineGraphdata = computed(() => {
  const filesData = <Results["filesDetails"]>healthData.value.filesDetails;
  const healthTermValueInFile = <HealthTermValueInFile[]>(
    healthData.value.healthTermsValues?.get(selectedHealthTerm.value)
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
    manuallyOpenedUploadArea.value || healthData.value.filesDetails.length === 0
);

const filesList = computed(() => healthData.value.filesDetails);
const isFileListEmpty = computed(() => filesList.value.length === 0);
const isHealthTermsListEmpty = computed(() => healthTerms.value.length > 0);
const toggleUploadAreaIconClass = computed(() =>
  manuallyOpenedUploadArea.value ? "fas fa-chevron-up" : "fas fa-file-arrow-up"
);
const isLneGraphCardVisible = computed(
  () =>
    lineGraphdata.value.length > 0 && healthData.value.filesDetails.length > 0
);
const clearResults = () => window.healthExamsParser.clearHealthData();

const toggleUploadAreaVissibility = () =>
  (manuallyOpenedUploadArea.value = !manuallyOpenedUploadArea.value);

const changeActiveHealthTerm = (newActiveHealthTerm: string) => {
  selectedHealthTerm.value = newActiveHealthTerm;
};
</script>

<template>
  <v-app id="app" class="py-0">
    <v-main class="bg-grey-lighten-3">
      <v-container class="rounded">
        <v-row class="pa-2">
          <v-col md="3" sm="12" v-if="isHealthTermsListEmpty">
            <v-sheet height="50vh" max-height="350px" rounded="lg" class="pa-2">
              <HealthTermsList
                :active="selectedHealthTerm"
                :health-terms="healthTerms"
                @active-health-term-updated="changeActiveHealthTerm"
              />
            </v-sheet>
          </v-col>

          <v-col md="9" sm="12" v-if="isLneGraphCardVisible">
            <v-sheet min-height="50vh" rounded="lg" class="pa-2">
              <LineGraph
                :graph-data="lineGraphdata"
                :label="selectedHealthTerm"
              ></LineGraph>
            </v-sheet>
          </v-col>
        </v-row>

        <v-row class="pa-2">
          <v-col sm="12">
            <v-sheet min-height="30vh" rounded="lg" class="pa-2">
              <header>
                <v-row>
                  <v-col cols="auto">
                    <h2>Files</h2>
                  </v-col>

                  <v-spacer></v-spacer>

                  <v-col class="px-0" cols="auto">
                    <v-tooltip text="Clear all" location="start">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          size="small"
                          icon="fas fa-broom"
                          color="error"
                          variant="text"
                          v-bind="props"
                          :disabled="isFileListEmpty"
                          @click="clearResults"
                        >
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </v-col>

                  <v-col class="px-0" cols="auto">
                    <v-tooltip text="Upload new health exam" location="start">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          class="mr-0"
                          size="small"
                          :icon="toggleUploadAreaIconClass"
                          color="primary"
                          variant="text"
                          v-bind="props"
                          :disabled="isFileListEmpty"
                          @click="toggleUploadAreaVissibility"
                        >
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </header>

              <main>
                <Transition>
                  <FilesUpload
                    class="upload-file-area pa-2"
                    :maxSize="5"
                    accept="pdf"
                    v-if="isUploadAreaVisible"
                  />
                </Transition>

                <FilesList
                  v-if="healthData.filesDetails.length > 0"
                  :files="healthData.filesDetails"
                  @clear-results="clearResults"
                  @toggle-upload-area-vissibility="toggleUploadAreaVissibility"
                />
              </main>
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
