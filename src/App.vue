<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useHealthDataStore } from "./stores/health-data";
import { labelForCode } from "./domain/medical-test";
import MedicalTestsList from "./components/MedicalTestsList.vue";
import MedicalReportsList from "./components/MedicalReportsList.vue";
import MedicalReportsCardHeader from "./components/MedicalReportsCardHeader.vue";
import FilesUploadArea from "./components/FilesUploadArea.vue";
import LineGraph from "./components/LineGraph.vue";

const store = useHealthDataStore();
const {
  reports,
  availableTestCodes,
  selectedTestCode,
  lineGraphPoints,
  isLineGraphVisible,
  isUploadAreaVisible,
} = storeToRefs(store);

onMounted(() => {
  void store.loadInitial();
});

const testOptions = () =>
  availableTestCodes.value.map((code) => ({ code, label: labelForCode(code) }));
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <header class="border-b border-gray-200 bg-white px-4 py-3">
      <h1 class="text-lg font-bold">Health Data Aggregator</h1>
    </header>

    <main class="mx-auto max-w-6xl space-y-4 p-4">
      <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-white p-3 shadow-sm md:col-span-1">
          <h2 class="mb-2 text-sm font-semibold text-gray-600">Medical tests</h2>
          <MedicalTestsList
            :tests="testOptions()"
            :selected="selectedTestCode"
            @select="store.selectTest"
          />
        </div>

        <div
          v-if="isLineGraphVisible"
          class="rounded-lg bg-white p-3 shadow-sm md:col-span-3"
        >
          <LineGraph
            :points="lineGraphPoints"
            :label="selectedTestCode ? labelForCode(selectedTestCode) : ''"
          />
        </div>
      </section>

      <section class="rounded-lg bg-white p-3 shadow-sm">
        <MedicalReportsCardHeader
          :is-empty="store.isEmpty"
          @toggle-upload="store.toggleUploadArea"
          @clear-all="store.clearAll"
        />

        <Transition name="fade">
          <div v-if="isUploadAreaVisible" class="my-3">
            <FilesUploadArea :max-size-mb="5" @files-selected="store.parseReports" />
          </div>
        </Transition>

        <MedicalReportsList :reports="reports" @remove="store.removeReport" />
      </section>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
