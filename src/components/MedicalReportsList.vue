<script setup lang="ts">
import { computed, ref } from "vue";
import type { FileDetails } from "../../common/interfaces";
import MedicalReportsListItem from "./MedicalReportsListItem.vue";

const props = defineProps<{
  medicalReports: FileDetails[];
}>();

const medicalReportsList = computed(() => props.medicalReports.reverse());
const isMedicalReportsListEmpty = computed(
  () => medicalReportsList.value.length === 0
);

const removeMedicalReport = (medicalReportIdToBeRemoved: number) => {
  window.medicalReportsParser.removeFile(medicalReportIdToBeRemoved);
};
</script>

<template>
  <v-container class="pa-2">
    <v-row no-gutters v-if="isMedicalReportsListEmpty">
      <v-col>
        <span> No medical reports so far</span>
      </v-col>
    </v-row>

    <section v-else>
      <MedicalReportsListItem
        v-for="medicalReports in medicalReportsList"
        :key="medicalReports.id"
        :file="{ id: medicalReports.id, name: medicalReports.name }"
        @medical-report-removed="removeMedicalReport"
      />
    </section>
  </v-container>
</template>

<style scoped></style>
