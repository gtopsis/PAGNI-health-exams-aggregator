<script setup lang="ts">
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

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement)?.files;
  // Check if file is selected
  if (!files || !files[0]) {
    return;
  }

  // Check if file is valid
  if (!isFileValid(files[0])) {
    console.error("Invalid file");
  }

  // Get uploaded file
  const file = files[0],
    // Get file size
    fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
    // Get file extension
    fileExtention = file.name.split(".").pop(),
    // Get file name
    fileName = file.name.split(".").shift(),
    // Check if file is an image
    isPdf =
      fileExtention === undefined
        ? false
        : ["pdf", "application/vnd.ms-excel"].includes(fileExtention);
  // Print to console
  console.log(fileSize, fileExtention, fileName, isPdf);
}

function isFileSizeValid(fileSize: number) {
  if (fileSize <= props.maxSize) {
    console.log("File size is valid");
  } else {
    errors.push(`File size should be less than ${props.maxSize} MB`);
  }
}

function isFileTypeValid(fileExtention: string) {
  if (props.accept.split(",").includes(fileExtention)) {
    console.log("File type is valid");
  } else {
    errors.push(`File type should be ${props.accept}`);
  }
}

function isFileValid(file) {
  isFileSizeValid(Math.round((file.size / 1024 / 1024) * 100) / 100);
  isFileTypeValid(file.name.split(".").pop());
  if (errors.length === 0) {
    return true;
  } else {
    return false;
  }
}
</script>

<template>
  <div class="file-upload">
    <div class="file-upload__area">
      <input
        type="file"
        name=""
        id=""
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
  height: 100vh;
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
