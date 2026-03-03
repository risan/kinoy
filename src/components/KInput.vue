<script setup lang="ts">
import { computed } from 'vue';
import type { InputProps } from '../types/form';
import { useFormField } from '../composables/useFormField';

defineOptions({
  name: 'KInput',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { inputId, errorId, hintId, field, resolvedError, ariaDescribedBy } = useFormField(props);

const inputValue = computed(() => (field ? (field.value.value ?? '') : (props.modelValue ?? '')));

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (field) {
    field.handleChange(value);
  }

  emit('update:modelValue', value);
}

function onBlur() {
  field?.handleBlur();
}
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <label v-if="label" :for="inputId" class="text-input text-input-label font-medium">
      {{ label }}<span v-if="required" class="text-input-error ml-0.5" aria-hidden="true">*</span>
    </label>

    <div class="flex items-center gap-1">
      <input
        v-bind="$attrs"
        :id="inputId"
        :type="type"
        :value="inputValue"
        :disabled="disabled || undefined"
        :required="required || undefined"
        :aria-invalid="resolvedError ? true : undefined"
        :aria-describedby="ariaDescribedBy"
        :aria-disabled="disabled || undefined"
        class="w-full rounded-input border bg-input-bg px-input-x py-input-y text-input text-input-text placeholder:text-input-placeholder outline-none transition-colors duration-150 focus:ring-2 disabled:cursor-not-allowed disabled:border-input-border-disabled disabled:bg-input-bg-disabled disabled:text-input-text-disabled"
        :class="
          resolvedError
            ? 'border-input-border-error hover:border-input-border-error focus:border-input-border-error focus:ring-input-ring-error'
            : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-input-ring'
        "
        @input="onInput"
        @blur="onBlur"
      />
      <span
        v-if="required && !label"
        class="shrink-0 text-input text-input-error"
        aria-hidden="true"
        >*</span
      >
    </div>

    <p v-if="hint" :id="hintId" class="text-input-caption text-input-placeholder">
      {{ hint }}
    </p>

    <p v-if="resolvedError" :id="errorId" role="alert" class="text-input-caption text-input-error">
      {{ resolvedError }}
    </p>
  </div>
</template>
