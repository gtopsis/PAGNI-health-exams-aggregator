<script setup lang="ts">
import { Ref, computed, ref } from "vue";
import {
  Results,
  HealthTermValueInFile,
  FileDetails,
} from "../common/interfaces";
import FileUpload from "./components/FileUpload.vue";
import LineGraph from "./components/LineGraph.vue";

let healthData: Ref<Results> = ref<Results | null>({
  filesData: [],
  healthDataOfAllFiles: new Map(),
});

// Called when new health data calculated
window.healthExamsParser.loadStoredHealtData(
  (event: unknown, data: Results) => {
    // console.debug(data);

    healthData.value = data;
  }
);

// Called when new health data calculated
window.healthExamsParser.receiveAggregatedHealtData(
  (event: unknown, data: Results) => {
    healthData.value = data;
  }
);

const clearResults = () => window.healthExamsParser.clearHealthData();

const graphTitle = "HCT Αιματοκρίτης";

const data = computed(() => {
  const filesData = <Results["filesData"]>healthData.value.filesData;
  const healthTermValueInFile = <HealthTermValueInFile[]>(
    healthData.value.healthDataOfAllFiles?.get("HCT Αιματοκρίτης")
  );

  const result =
    healthTermValueInFile?.map(
      ({
        fileId,
        healthTermValue,
      }: {
        fileId: string;
        healthTermValue: number;
      }) => {
        return {
          date: filesData.find(
            (fileData: FileDetails) => fileData.fileId === fileId
          ).date,
          value: healthTermValue,
        };
      }
    ) || [];

  return result;
});

const removeFile = (filePath: string) =>
  window.healthExamsParser.removeFile(filePath);

let isUploadAreaVisible = ref(false);
const toggleUploadArea = () => {
  isUploadAreaVisible.value = !isUploadAreaVisible.value;
};
</script>

<template>
  <v-app id="app">
    <v-app-bar>
      <v-toolbar-title>Health data Aggregator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="toggleUploadArea">
        <span>Upload health exam(s)</span>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <Transition>
          <v-row v-if="isUploadAreaVisible">
            <v-col class="upload-file-area">
              <FileUpload :maxSize="5" accept="pdf" />
            </v-col>
          </v-row>
        </Transition>

        <v-row>
          <v-col cols="2" px="3">
            <v-sheet rounded="lg">
              <v-list rounded="lg">
                <v-list-item v-for="n in 4" :key="n" link>
                  <v-list-item-title> List Item {{ n }} </v-list-item-title>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item link color="grey-lighten-4">
                  <v-list-item-title> Refresh </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col px="4">
            <v-sheet min-height="70vh" rounded="lg">
              <LineGraph
                v-if="data.length"
                :graph-data="data"
                :label="graphTitle"
              ></LineGraph>

              <div class="flex-center" v-if="healthData.filesData.length !== 0">
                <v-btn color="error" @click="clearResults">Clear results</v-btn>
              </div>

              <h3>Files</h3>
              <span v-if="healthData.filesData.length === 0">
                No files so far</span
              >

              <div v-else>
                <div
                  v-for="file in healthData.filesData"
                  class="files-list-item"
                >
                  <div class="files-list-item_description">
                    <small>{{ file.filePath }}</small>
                  </div>
                  <div class="files-list-item_action">
                    <v-btn color="error" @click="removeFile(file.filePath)"
                      >Remove</v-btn
                    >
                  </div>
                </div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
#app {
  width: 100%;
  padding-left: 0;
  padding-right: 0;
}

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

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

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

.upload-file-area {
  width: 100%;
  height: 350px;
  transition: all 0.25s ease;
}

/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
