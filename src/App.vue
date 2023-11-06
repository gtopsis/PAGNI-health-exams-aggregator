<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Results,
  MedicalTestResultFromFile,
  FileDetails,
} from "../common/interfaces";
import MedicalTestsList from "./components/MedicalTestsList.vue";

import FilesUploadArea from "./components/FilesUploadArea.vue";
import LineGraph from "./components/LineGraph.vue";
import MedicalReportsList from "./components/MedicalReportsList.vue";
import MedicalReportsCardHeader from "./components/MedicalReportsCardHeader.vue";

let healthData = ref<Results>({
  filesDetails: new Array<FileDetails>(),
  resultsForAllMedicalTestsFromAllFiles: new Map<
    string,
    MedicalTestResultFromFile[]
  >(),
});

const medicalTests = computed<string[]>(() =>
  Array.from(
    healthData.value.resultsForAllMedicalTestsFromAllFiles.keys()
  ).sort()
);
const selectedMedicalTest = ref<string>(medicalTests.value?.[0]);

// Called when new health data calculated
window.medicalReportsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedMedicalTest.value = medicalTests.value?.[0];
  }
);

// Callback called when new health data calculated in the ipcRenderer
window.medicalReportsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
    selectedMedicalTest.value = medicalTests.value?.[0];
  }
);

const filesDetailsList = computed<Results["filesDetails"]>(
  () => healthData.value.filesDetails
);
const lineGraphData = computed(() => {
  const medicalTestResultFromFile = <MedicalTestResultFromFile[]>(
    healthData.value.resultsForAllMedicalTestsFromAllFiles?.get(
      selectedMedicalTest.value
    )
  );

  const result = medicalTestResultFromFile?.map(
    ({ fileId, medicalTestResult }: MedicalTestResultFromFile) => ({
      date: filesDetailsList.value.find(({ id }: FileDetails) => id === fileId)
        ?.date,
      value: medicalTestResult,
    })
  );

  return result || [];
});
const isLineGraphCardVisible = computed(
  () => lineGraphData.value.length > 0 && filesDetailsList.value.length > 0
);

const isMedicalTestsListEmpty = computed(() => medicalTests.value.length > 0);
const selectActiveMedicalTest = (newActiveHealthTerm: string) => {
  selectedMedicalTest.value = newActiveHealthTerm;
};

const removeAllMedicalReports = () =>
  window.medicalReportsParser.clearHealthData();

let manuallyOpenedUploadArea = ref(true);
const toggleUploadAreaVissibility = () => {
  manuallyOpenedUploadArea.value = !manuallyOpenedUploadArea.value;
};
const isUploadAreaVisible = computed(
  () => manuallyOpenedUploadArea.value || filesDetailsList.value.length === 0
);
</script>

<template>
  <v-app id="app" class="py-0">
    <v-main class="bg-grey-lighten-3">
      <v-container class="rounded">
        <v-row class="pa-2">
          <v-col md="3" sm="12" v-if="isMedicalTestsListEmpty">
            <v-sheet height="50vh" max-height="350px" rounded="lg" class="pa-2">
              <MedicalTestsList
                :active="selectedMedicalTest"
                :medical-tests="medicalTests"
                @medical-test-selected="selectActiveMedicalTest"
              />
            </v-sheet>
          </v-col>

          <v-col md="9" sm="12" v-if="isLineGraphCardVisible">
            <v-sheet min-height="50vh" rounded="lg" class="pa-2">
              <LineGraph
                :graph-data="lineGraphData"
                :label="selectedMedicalTest"
              ></LineGraph>
            </v-sheet>
          </v-col>
        </v-row>

        <v-row class="pa-2">
          <v-col sm="12">
            <v-sheet min-height="30vh" rounded="lg" class="pa-2">
              <MedicalReportsCardHeader
                :isMedicalReportsListEmpty="filesDetailsList.length === 0"
                @all-medical-reports-removed="removeAllMedicalReports"
                @upload-area-vissibility-updated="toggleUploadAreaVissibility"
              />

              <main>
                <Transition>
                  <FilesUploadArea
                    v-if="isUploadAreaVisible"
                    class="upload-file-area pa-2"
                    :maxSize="5"
                    accept="pdf"
                  />
                </Transition>

                <MedicalReportsList
                  v-if="!isUploadAreaVisible"
                  :medical-reports="filesDetailsList"
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
