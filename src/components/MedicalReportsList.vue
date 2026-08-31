<script setup lang="ts">
import type { MedicalReport } from "../domain/types";

defineProps<{
  reports: MedicalReport[];
}>();

const emit = defineEmits<{
  remove: [id: string];
}>();
</script>

<template>
  <p v-if="reports.length === 0" class="p-2 text-sm text-gray-500 italic">
    No reports uploaded yet.
  </p>

  <ul v-else class="divide-y divide-gray-200">
    <li
      v-for="report in reports"
      :key="report.id"
      data-testid="report-row"
      class="flex items-center justify-between gap-4 px-2 py-2"
    >
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-gray-900">
          {{ report.name }}
        </p>
        <p class="text-xs text-gray-500">
          {{ report.date ?? "Unknown date" }}
        </p>
      </div>

      <button
        type="button"
        data-testid="remove-report"
        :aria-label="`Remove ${report.name}`"
        class="shrink-0 rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        @click="emit('remove', report.id)"
      >
        Remove
      </button>
    </li>
  </ul>
</template>
