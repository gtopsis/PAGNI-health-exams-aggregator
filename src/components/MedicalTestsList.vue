<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  active: string;
  medicalTests: string[];
}>();
const emit = defineEmits<{
  (e: "medical-test-selected", newValue: string): void;
}>();

const activeHealthTerm = ref(props.active);

const updateActiveHealthTerm = () => {
  emit("medical-test-selected", activeHealthTerm.value);
};
</script>

<template>
  <v-container class="medical-tests-list pa-0">
    <v-row
      v-for="medicalTest in medicalTests"
      :key="medicalTest"
      class="py-1"
      no-gutters
      align="center"
    >
      <v-col md="auto" sm="1">
        <input
          class="medical-test-list-item__radio-btn"
          type="radio"
          name="healthTermsRadioBtnGroup"
          :id="medicalTest"
          v-model="activeHealthTerm"
          :value="medicalTest"
          @change="updateActiveHealthTerm"
        />
      </v-col>

      <v-col class="pl-2 text-left">
        <label class="medical-test-list-item__label" :for="medicalTest">
          <small> {{ medicalTest }} </small>
        </label>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.medical-tests-list {
  height: 100%;
  max-height: 100%;
  /* max-height: 350px; */
  overflow-y: auto;
}

.medical-test-list-item__label:hover,
.medical-test-list-item__radio-btn:hover {
  cursor: pointer;
}
</style>
