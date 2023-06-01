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
const errors: string[] = [];
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

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  // Get uploaded file
  const file = files?.[0];

  // Check if file is selected
  if (!file) {
    return;
  }

  // Check if file is valid
  if (!isFileValid(file)) {
    console.error("Invalid file");
  }

  window.healthExamsParser.parseHealthExams([(file as FileWithPath).path]);

  const fileHTMLEl = <HTMLInputElement>document.getElementById("fileUploadBtn");
  if (fileHTMLEl) {
    fileHTMLEl.value = "";
  }
};

const isFileSizeValid = (fileSize: number) => {
  if (fileSize > props.maxSize) {
    errors.push(`File size should be less than ${props.maxSize} MB`);
  }
};

const isFileTypeValid = (fileExtention: string) => {
  if (!props.accept.split(",").includes(fileExtention)) {
    errors.push(`File type should be ${props.accept}`);
  }
};

const isFileValid = (file: File) => {
  isFileSizeValid(Math.round((file.size / 1024 / 1024) * 100) / 100);
  const filename = file.name?.split(".").pop();
  if (!filename) {
    return false;
  }

  isFileTypeValid(filename);

  return errors.length === 0;
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

      <div v-if="errors.length > 0">
        <div
          class="file-upload__error"
          v-for="(error, index) in errors"
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
