<script setup lang="ts">
import { computed, ref } from "vue";
import { FileDetails } from "../../common/interfaces";
import FilesListItem from "./FilesListItem.vue";

const props = defineProps<{
  files: FileDetails[];
}>();

const emit = defineEmits<{
  (e: "clear-results"): void;
  (e: "toggle-upload-area-vissibility"): void;
}>();

const filesList = computed(() => props.files.reverse());
const isFileaListEmpty = computed(() => props.files.length === 0);

const removeFile = (candidateFileIdToBeRemoved: number) => {
  window.medicalReportsParser.removeFile(candidateFileIdToBeRemoved);
};
</script>

<template>
  <v-container class="pa-2">
    <v-row no-gutters v-if="isFileaListEmpty">
      <v-col>
        <span> No files so far</span>
      </v-col>
    </v-row>

    <section v-else>
      <FilesListItem
        v-for="file in filesList"
        :key="file.id"
        :file="{ id: file.id, name: file.name }"
        @file-remove="removeFile"
      />
    </section>
  </v-container>
</template>

<style scoped>
.files-list-item {
}

.files-list-item_description {
}

.files-list-item_action {
}
</style>
