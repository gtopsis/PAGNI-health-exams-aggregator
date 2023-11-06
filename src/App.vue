<script setup lang="ts">
import { ComputedRef, computed, ref } from "vue";
import {
  Results,
  MedicalTestResultFromFile,
  FileDetails,
} from "../common/interfaces";
import MedicalTestsList from "./components/MedicalTestsList.vue";

import FilesUpload from "./components/FilesUpload.vue";
import LineGraph from "./components/LineGraph.vue";
import FilesList from "./components/FilesList.vue";
import MedicalReportsCardHeader from "./components/MedicalReportsCardHeader.vue";

let manuallyOpenedUploadArea = ref(true);
let healthData = ref<Results>({
  filesDetails: new Array<FileDetails>(),
  resultsForAllMedicalTestsFromAllFiles: new Map<
    string,
    MedicalTestResultFromFile[]
  >(),
});

const medicalTests: ComputedRef<string[]> = computed(() =>
  Array.from(
    healthData.value.resultsForAllMedicalTestsFromAllFiles.keys()
  ).sort()
);
const selectedHealthTerm = ref<string>(medicalTests.value?.[0]);

// Called when new health data calculated
window.medicalReportsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedHealthTerm.value = medicalTests.value?.[0];
  }
);

// Called when new health data calculated
window.medicalReportsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedHealthTerm.value = medicalTests.value?.[0];
  }
);

const lineGraphdata = computed(() => {
  const filesData = <Results["filesDetails"]>healthData.value.filesDetails;
  const healthTermValueInFile = <MedicalTestResultFromFile[]>(
    healthData.value.resultsForAllMedicalTestsFromAllFiles?.get(
      selectedHealthTerm.value
    )
  );

  const result =
    healthTermValueInFile?.map(
      ({ fileId, medicalTestResult }: MedicalTestResultFromFile) => ({
        date: filesData.find((fileData: FileDetails) => fileData.id === fileId)
          ?.date,
        value: medicalTestResult,
      })
    ) || [];

  return result;
});

const isUploadAreaVisible = computed(
  () =>
    manuallyOpenedUploadArea.value || healthData.value.filesDetails.length === 0
);

const filesList = computed(() => healthData.value.filesDetails);
const isHealthTermsListEmpty = computed(() => medicalTests.value.length > 0);

const isLneGraphCardVisible = computed(
  () =>
    lineGraphdata.value.length > 0 && healthData.value.filesDetails.length > 0
);

const removeAllMedicalReports = () =>
  window.medicalReportsParser.clearHealthData();

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
              <MedicalTestsList
                :active="selectedHealthTerm"
                :medical-tests="medicalTests"
                @active-medical-test-updated="changeActiveHealthTerm"
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
              <MedicalReportsCardHeader
                :isFileListEmpty="filesList.length === 0"
                @remove-all-medical-reports="removeAllMedicalReports"
                @toggle-upload-area-vissibility="toggleUploadAreaVissibility"
              />

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
