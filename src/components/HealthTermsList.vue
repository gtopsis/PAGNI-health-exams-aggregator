<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  active: string;
  healthTerms: string[];
}>();
const emit = defineEmits<{
  (e: "active-health-term-updated", newValue: string): void;
}>();

const activeHealthTerm = ref(props.active);

const updateActiveHealthTerm = () => {
  emit("active-health-term-updated", activeHealthTerm.value);
};
</script>

<template>
  <v-container class="health-terms-list pa-2">
    <v-row
      v-for="healthTerm in healthTerms"
      :key="healthTerm"
      class="py-2"
      no-gutters
      align="center"
    >
      <v-col cols="2" lg="1">
        <input
          class="health-term-list-item__radio-btn"
          type="radio"
          name="healthTermsRadioBtnGroup"
          :id="healthTerm"
          v-model="activeHealthTerm"
          :value="healthTerm"
          @change="updateActiveHealthTerm"
        />
      </v-col>

      <v-col class="pl-2 text-left">
        <label class="health-term-list-item__label" :for="healthTerm">{{
          healthTerm
        }}</label>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.health-terms-list {
  max-height: 350px;
  overflow-y: auto;
}
.health-term-list-item__label:hover,
.health-term-list-item__radio-btn:hover {
  cursor: pointer;
}
</style>
