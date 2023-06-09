<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  numberOfFiles: number;
}>();
const emit = defineEmits<{
  (e: "clear-results"): void;
  (e: "toggle-upload-area-vissibility"): void;
}>();

const noFilesExists = computed(() => props.numberOfFiles === 0);

const clearResults = () => emit("clear-results");
const toggleUploadAreaVissibility = () =>
  emit("toggle-upload-area-vissibility");
</script>

<template>
  <v-app-bar>
    <v-toolbar-title>Health data Aggregator</v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn
      size="small"
      icon="fas fa-remove"
      color="error"
      :disabled="noFilesExists"
      @click="clearResults"
    >
    </v-btn>

    <v-btn
      size="small"
      icon="fas fa-upload"
      color="primary"
      :disabled="noFilesExists"
      @click="toggleUploadAreaVissibility"
    >
    </v-btn>
  </v-app-bar>
</template>

<style scoped></style>
