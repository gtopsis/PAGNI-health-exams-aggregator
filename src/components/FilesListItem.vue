<script setup lang="ts">
import { ref } from "vue";

interface File {
  id: number;
  name: string;
}
const props = defineProps<{ file: File }>();
const emit = defineEmits<{
  (event: "file-remove", fileId: number): void;
}>();

const isConfirmationdialogForFileRemovalOpen = ref(false);

const openConfirmationDialogForFileRemoval = (filename: string) => {
  isConfirmationdialogForFileRemovalOpen.value = true;
};

const removeFile = () => {
  emit("file-remove", props.file.id);

  isConfirmationdialogForFileRemovalOpen.value = false;
};
</script>

<template>
  <div>
    <v-row class="files-list-item py-2" no-gutters align="center">
      <v-col class="files-list-item_description text-left" cols="8">
        <small class="text-left">{{ file.name }}</small>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="files-list-item_action" cols="auto">
        <v-tooltip text="Remove health exam" location="start">
          <template v-slot:activator="{ props }">
            <v-btn
              size="x-small"
              variant="text"
              icon="fas fa-remove"
              color="error"
              v-bind="props"
              @click="openConfirmationDialogForFileRemoval(file.name)"
            ></v-btn>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-dialog v-model="isConfirmationdialogForFileRemovalOpen" width="70%">
      <v-card>
        <v-card-text>
          Are you sure you want to remove the file
          <strong>{{ file.name }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="isConfirmationdialogForFileRemovalOpen = false"
            >Cancel</v-btn
          >
          <v-btn color="error" @click="removeFile">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped></style>
