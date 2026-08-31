<script setup lang="ts">
interface TestOption {
  code: string;
  label: string;
}

defineProps<{
  tests: TestOption[];
  selected: string | undefined;
}>();

const emit = defineEmits<{
  select: [code: string];
}>();
</script>

<template>
  <div class="h-full max-h-full overflow-y-auto">
    <p v-if="tests.length === 0" class="p-2 text-sm text-gray-500 italic">
      No tests parsed yet.
    </p>

    <ul v-else role="radiogroup" aria-label="Medical tests">
      <li
        v-for="test in tests"
        :key="test.code"
        class="flex items-center gap-2 px-2 py-1"
      >
        <input
          type="radio"
          name="medical-test"
          :id="`test-${test.code}`"
          :value="test.code"
          :checked="selected === test.code"
          class="cursor-pointer accent-teal-600"
          @change="emit('select', test.code)"
        />
        <label
          :for="`test-${test.code}`"
          class="cursor-pointer text-sm text-gray-800"
        >
          {{ test.label }}
        </label>
      </li>
    </ul>
  </div>
</template>
