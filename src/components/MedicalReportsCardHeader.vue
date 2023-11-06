<script setup lang="ts">
import { ref } from "vue";
import { computed } from "vue";

const props = defineProps<{
  isFileListEmpty: boolean;
}>();
const emit = defineEmits<{
  (e: "remove-all-medical-reports"): void;
  (e: "toggle-upload-area-vissibility", isUploadAreaVisible: boolean): void;
}>();

let manuallyOpenedUploadArea = ref(true);
const removeAllMedicalReports = () => emit("remove-all-medical-reports");

const toggleUploadAreaIconClass = computed(() =>
  manuallyOpenedUploadArea.value ? "fas fa-chevron-up" : "fas fa-file-arrow-up"
);

const toggleUploadAreaVissibility = () => {
  manuallyOpenedUploadArea.value = !manuallyOpenedUploadArea.value;
  emit("toggle-upload-area-vissibility", manuallyOpenedUploadArea.value);
};
</script>

<template>
  <header>
    <v-row>
      <v-col cols="auto">
        <h2>Medical Reports</h2>
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
              @click="removeAllMedicalReports"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </v-col>

      <v-col class="px-0" cols="auto">
        <v-tooltip text="Upload new medical report" location="start">
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
</template>

<style scoped></style>
