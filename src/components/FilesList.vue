<script setup lang="ts">
import { computed, ref } from "vue";
import { FileDetails } from "../../common/interfaces";

const props = defineProps<{
  files: FileDetails[];
}>();
// const emit = defineEmits<{
//   (e: "active-health-term-updated", newValue: string): void;
// }>();

const filesList = computed(() => props.files);
const isConfirmationdialogForFileRemovalOpen = ref(false);
const candidateFileToBeRemoved = ref("");

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
  <v-container class="health-terms-list pa-2">
    <v-row
      v-for="file in filesList"
      :key="file.fileId"
      class="files-list-item py-2"
      no-gutters
      align="center"
    >
      <v-col class="files-list-item_description">
        <small>{{ file.filePath }}</small>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="files-list-item_action" cols="2">
        <v-btn
          size="x-small"
          color="error"
          small
          @click="openConfirmationDialogForFileRemoval(file.filePath)"
          >Remove</v-btn
        >
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="isConfirmationdialogForFileRemovalOpen" width="auto">
    <v-card>
      <v-card-text>
        Are you sure you want to remove the file
        <strong>{{ candidateFileToBeRemoved }}</strong
        >?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="removeFile()">Remove</v-btn>
        <v-btn
          color="primary"
          @click="isConfirmationdialogForFileRemovalOpen = false"
          >Cancel</v-btn
        >
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
  max-width: 75%;
}

.files-list-item_action {
  /* width: 20%; */
}
</style>
