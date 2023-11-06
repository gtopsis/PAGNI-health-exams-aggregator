<script setup lang="ts">
import { computed, ref } from "vue";
import { FileDetails } from "../../common/interfaces";
import MedicalReportsListItem from "./MedicalReportsListItem.vue";

const props = defineProps<{
  files: FileDetails[];
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
      <MedicalReportsListItem
        v-for="file in filesList"
        :key="file.id"
        :file="{ id: file.id, name: file.name }"
        @file-remove="removeFile"
      />
    </section>
  </v-container>
</template>

<style scoped></style>
