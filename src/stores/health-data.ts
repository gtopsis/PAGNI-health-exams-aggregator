import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { HealthData, ReportId } from "../domain/types";
import { testCodesWithData, lineGraphPointsForTest } from "../domain/health-data";
import * as api from "../api/tauri-api";

export const useHealthDataStore = defineStore("health-data", () => {
  // --- state ---
  const healthData = ref<HealthData>({ reports: [] });
  const selectedTestCode = ref<string | undefined>(undefined);
  const isUploadAreaOpen = ref(true);

  // --- getters ---
  const reports = computed(() => healthData.value.reports);
  const isEmpty = computed(() => healthData.value.reports.length === 0);
  const availableTestCodes = computed(() => testCodesWithData(healthData.value));
  const lineGraphPoints = computed(() =>
    selectedTestCode.value
      ? lineGraphPointsForTest(healthData.value, selectedTestCode.value)
      : []
  );
  const isLineGraphVisible = computed(
    () => lineGraphPoints.value.length > 0 && !isEmpty.value
  );
  const isUploadAreaVisible = computed(
    () => isUploadAreaOpen.value || isEmpty.value
  );

  // --- internal helpers ---
  function applyData(data: HealthData) {
    healthData.value = data;
    const codes = testCodesWithData(data);
    if (!selectedTestCode.value || !codes.includes(selectedTestCode.value)) {
      selectedTestCode.value = codes[0];
    }
  }

  // --- actions ---
  async function loadInitial() {
    applyData(await api.loadInitial());
  }

  async function parseReports(paths: string[]) {
    if (paths.length === 0) return;
    applyData(await api.parseReports(paths));
  }

  async function removeReport(id: ReportId) {
    applyData(await api.removeReport(id));
  }

  async function clearAll() {
    applyData(await api.clearAll());
  }

  function selectTest(code: string) {
    selectedTestCode.value = code;
  }

  function toggleUploadArea() {
    isUploadAreaOpen.value = !isUploadAreaOpen.value;
  }

  return {
    // state
    healthData,
    selectedTestCode,
    isUploadAreaOpen,
    // getters
    reports,
    isEmpty,
    availableTestCodes,
    lineGraphPoints,
    isLineGraphVisible,
    isUploadAreaVisible,
    // actions
    loadInitial,
    parseReports,
    removeReport,
    clearAll,
    selectTest,
    toggleUploadArea,
  };
});
