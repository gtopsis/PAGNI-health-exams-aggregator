<script setup lang="ts">
import { ref } from "vue";
import { open } from "@tauri-apps/plugin-dialog";
import { validatePdfFiles } from "../domain/file-validation";

const props = withDefaults(
  defineProps<{
    maxSizeMb?: number;
  }>(),
  { maxSizeMb: 5 }
);

const emit = defineEmits<{
  filesSelected: [paths: string[]];
}>();

const errors = ref<string[]>([]);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Native file dialog (Tauri) — returns real filesystem paths.
async function pickFiles() {
  const selected = await open({
    multiple: true,
    filters: [{ name: "PDF reports", extensions: ["pdf"] }],
  });
  if (!selected) return;
  const paths = Array.isArray(selected) ? selected : [selected];
  emitPaths(paths);
}

function emitPaths(paths: string[]) {
  if (paths.length > 0) {
    errors.value = [];
    emit("filesSelected", paths);
  }
}

// Drag & drop fallback (works with web File objects in the WebView).
function onDrop(event: DragEvent) {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files ?? []);
  if (files.length === 0) return;

  const candidates = files.map((f) => ({
    name: f.name,
    sizeMb: f.size / 1024 / 1024,
  }));
  const result = validatePdfFiles(candidates, props.maxSizeMb);
  errors.value = result.errors;

  const accepted = files.filter((f) => result.valid.includes(f.name));
  // In the WebView, dropped File objects expose a filesystem path.
  const paths = accepted
    .map((f) => (f as File & { path?: string }).path)
    .filter((p): p is string => typeof p === "string" && p.length > 0);
  emitPaths(paths);
}
</script>

<template>
  <div
    class="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors"
    :class="
      isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50'
    "
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <p class="text-sm text-gray-600">
      Drag &amp; drop PDF blood-test reports here, or
    </p>

    <button
      type="button"
      data-testid="pick-files"
      class="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
      @click="pickFiles"
    >
      Browse files…
    </button>

    <!-- Hidden input kept for environments without the native dialog. -->
    <input ref="fileInput" type="file" accept="application/pdf" multiple hidden />

    <ul v-if="errors.length > 0" class="w-full">
      <li
        v-for="(error, i) in errors"
        :key="i"
        data-testid="upload-error"
        class="text-sm text-red-600"
      >
        {{ error }}
      </li>
    </ul>
  </div>
</template>
