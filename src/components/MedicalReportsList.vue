<script setup lang="ts">
import { computed, ref } from "vue";
import type { MedicalReport } from "../../common/interfaces";
import MedicalReportsListItem from "./MedicalReportsListItem.vue";

const props = defineProps<{
  medicalReports: MedicalReport[];
}>();

const isMedicalReportsListEmpty = computed(
  () => props.medicalReports.length === 0
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
        v-for="medicalReport in medicalReports"
        :key="medicalReport.id"
        :file="{ id: medicalReport.id, name: medicalReport.name }"
        @medical-report-removed="removeMedicalReport"
      />
    </section>
  </v-container>
</template>

<style scoped></style>
