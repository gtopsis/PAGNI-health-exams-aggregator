<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  isEmpty: boolean;
}>();

const emit = defineEmits<{
  "toggle-upload": [];
  "clear-all": [];
}>();

const confirmingClear = ref(false);

function requestClear() {
  confirmingClear.value = true;
}
function confirmClear() {
  confirmingClear.value = false;
  emit("clear-all");
}
function cancelClear() {
  confirmingClear.value = false;
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 px-2 py-1">
    <h2 class="text-base font-semibold text-gray-800">Medical reports</h2>

    <div class="flex items-center gap-2">
      <button
        type="button"
        data-testid="toggle-upload"
        class="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
        @click="emit('toggle-upload')"
      >
        Toggle upload
      </button>

      <template v-if="!isEmpty">
        <button
          v-if="!confirmingClear"
          type="button"
          data-testid="clear-all"
          class="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          @click="requestClear"
        >
          Clear all
        </button>

        <div v-else class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Delete all reports?</span>
          <button
            type="button"
            data-testid="confirm-clear"
            class="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
            @click="confirmClear"
          >
            Confirm
          </button>
          <button
            type="button"
            data-testid="cancel-clear"
            class="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
            @click="cancelClear"
          >
            Cancel
          </button>
        </div>
      </template>
    </div>
  </header>
</template>
