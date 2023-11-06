<script setup lang="ts">
import type { UploadedFileMetadata } from "../../common/interfaces";

interface FileWithPath extends File {
  path: string;
}

const props = defineProps({
  maxSize: {
    type: Number,
    default: 5,
    required: true,
  },
  accept: {
    type: String,
    default: "pdf",
  },
});

const name = "FileUpload";
const isLoading = false;
const uploadReady = true;
const file = {
  name: "",
  size: 0,
  type: "",
  fileExtention: "",
  url: "",
  isPdf: false,
  isUploaded: false,
};

let fileErrors: string[] = [];
const handleFilesChange = (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;

  // Check if file is selected
  if (!files) {
    console.error("No file uploaded correctly");

    return;
  }

  for (const file of files) {
    // Check if file is valid
    fileErrors = getFileErrors(file);
    if (fileErrors.length > 0) {
      console.error(`Invalid file.\n Errors:\n ${fileErrors.join("\n")}`);

      return;
    }
  }

  const filesMetadata: UploadedFileMetadata[] = Array.from(files).map((f) => ({
    path: (f as FileWithPath).path,
    name: f.name,
  }));
  window.medicalReportsParser.parseNewMedicalReports(filesMetadata);

  // reset html element
  const fileHTMLEl = <HTMLInputElement>document.getElementById("fileUploadBtn");
  if (fileHTMLEl) {
    fileHTMLEl.value = "";
  }
};

const isFileSizeValid = (fileSize: number) => fileSize <= props.maxSize;

const isFileTypeValid = (fileExtention: string | undefined) =>
  fileExtention && props.accept.split(",").includes(fileExtention);

const getFileErrors = (file: File) => {
  const errors: string[] = [];

  const fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100;

  if (!isFileSizeValid(fileSize)) {
    errors.push(`File size should be less than ${props.maxSize} MB`);
  }

  const filenameExtension = file.name?.split(".").pop();
  if (!filenameExtension) {
    errors.push(`File name is not correct`);
  }

  if (!isFileTypeValid(filenameExtension)) {
    errors.push(`File type should be ${props.accept}`);
  }

  return errors;
};
</script>

<template>
  <v-container class="file-upload pa-2 align-center justify-center">
    <v-row
      no-gutters
      class="file-upload__area d-flex align-center justify-center"
    >
      <input
        type="file"
        name=""
        id="fileUploadBtn"
        @change="handleFilesChange($event)"
        accept="application/pdf,application/vnd.ms-excel"
        multiple
      />

      <div v-if="fileErrors.length > 0">
        <div
          class="file-upload__error"
          v-for="(error, index) in fileErrors"
          :key="index"
        >
          <span>{{ error }}</span>
        </div>
      </div>
    </v-row>
  </v-container>
</template>

<style scoped>
.file-upload {
  height: 300px;
  width: 100%;
}

.file-upload .file-upload__area {
  width: 100%;
  min-height: 100%;
  border: 2px dashed #ccc;
}

.file-upload .file-upload__error {
  color: red;
}
</style>
