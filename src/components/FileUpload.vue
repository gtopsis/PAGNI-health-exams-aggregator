<script setup lang="ts">
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
const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  // Get uploaded file
  const file = files?.[0];

  // Check if file is selected
  if (!file) {
    console.error("No file uploaded correctly");

    return;
  }

  // Check if file is valid
  fileErrors = getFileErrors(file);
  if (fileErrors.length > 0) {
    console.error(`Invalid file.\n Errors:\n ${fileErrors.join("\n")}`);

    return;
  }

  window.healthExamsParser.parseHealthExams([(file as FileWithPath).path]);

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
  <div class="file-upload">
    <div class="file-upload__area">
      <input
        type="file"
        name=""
        id="fileUploadBtn"
        @change="handleFileChange($event)"
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
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  height: 300px;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.file-upload .file-upload__area {
  width: 600px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  margin-top: 40px;
}
</style>
