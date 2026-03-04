<script setup lang="ts">
import { computed } from 'vue';
import type { LoadingProps } from '../types/form';

defineOptions({
  name: 'JLoading',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<LoadingProps>(), {
  size: 'md',
  color: 'current',
  label: 'Loading...',
  overlay: false,
});

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  return map[props.size];
});

const colorClass = computed(() => {
  const map: Record<string, string> = {
    current: 'text-current',
    primary: 'text-primary',
    muted: 'text-input-placeholder',
  };
  return map[props.color];
});

// Spinner SVG is intentionally duplicated: overlay needs <div> wrapper, inline needs <span>
</script>

<template>
  <div
    v-if="overlay"
    v-bind="$attrs"
    role="status"
    aria-live="polite"
    :aria-label="label"
    :class="['absolute inset-0 z-10 flex items-center justify-center bg-white/60', colorClass]"
  >
    <svg
      :class="['animate-spin', sizeClass]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
  <span
    v-else
    v-bind="$attrs"
    role="status"
    aria-live="polite"
    :aria-label="label"
    :class="['inline-flex items-center', colorClass]"
  >
    <svg
      :class="['animate-spin', sizeClass]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </span>
</template>
