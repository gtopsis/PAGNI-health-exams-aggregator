<script setup lang="ts">
import { ref } from "vue";
import { Results } from "../common/interfaces";
import FileUpload from "./components/FileUpload.vue";

let healthData = ref<Results | undefined>();

// Called when message received from main process
window.healthExamsParser.receiveFromD((event: unknown, data: Results) => {
  console.log(`Received from main process`);
  console.log(data);

  healthData.value = data;
});

const parseHealthExams = () => {
  window.healthExamsParser.parseHealthExams();
};
</script>

<template>
  <!-- <div>
    <button @click="parseHealthExams">Parse health exams</button>
  </div>

  <div class="flex-center">
    {{ healthData }}
  </div> -->

  <FileUpload :maxSize="5" accept="pdf" />
</template>

<style>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9feaf9);
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
