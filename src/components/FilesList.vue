<script setup lang="ts">
import { computed, ref } from "vue";
import { FileDetails } from "../../common/interfaces";

const props = defineProps<{
  files: FileDetails[];
}>();

const emit = defineEmits<{
  (e: "clear-results"): void;
  (e: "toggle-upload-area-vissibility"): void;
}>();

const filesList = computed(() => props.files);
const isFileListEmpty = computed(() => filesList.value.length === 0);
const isConfirmationdialogForFileRemovalOpen = ref(false);
const candidateFileToBeRemoved = ref("");

const clearResults = () => emit("clear-results");
const toggleUploadAreaVissibility = () =>
  emit("toggle-upload-area-vissibility");

const openConfirmationDialogForFileRemoval = (filePath: string) => {
  isConfirmationdialogForFileRemovalOpen.value = true;
  candidateFileToBeRemoved.value = filePath;
};

const removeFile = () => {
  window.healthExamsParser.removeFile(candidateFileToBeRemoved.value);
  candidateFileToBeRemoved.value = "";
  isConfirmationdialogForFileRemovalOpen.value = false;
};
</script>

<template>
  <v-container class="pa-2">
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
              icon="fas fa-upload"
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
    <v-row no-gutters v-if="isFileListEmpty">
      <v-col>
        <span> No files so far</span>
      </v-col>
    </v-row>

    <v-row
      v-for="file in filesList"
      :key="file.fileId"
      class="files-list-item py-2"
      no-gutters
      align="center"
      v-else
    >
      <v-col class="files-list-item_description text-left" cols="8">
        <small class="text-left">{{ file.filePath }}</small>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="files-list-item_action" cols="auto">
        <v-btn
          size="x-small"
          variant="text"
          icon="fas fa-remove"
          color="error"
          @click="openConfirmationDialogForFileRemoval(file.filePath)"
        ></v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="isConfirmationdialogForFileRemovalOpen" width="70%">
    <v-card>
      <v-card-text>
        Are you sure you want to remove the file
        <strong>{{ candidateFileToBeRemoved }}</strong
        >?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="isConfirmationdialogForFileRemovalOpen = false"
          >Cancel</v-btn
        >
        <v-btn color="error" @click="removeFile">Remove</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.files-list-item {
  display: flex;
  justify-content: space-between;
}

.files-list-item_description {
}

.files-list-item_action {
}
</style>
