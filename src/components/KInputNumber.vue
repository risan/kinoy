<script setup lang="ts">
import { computed, watch } from 'vue';
import { useCurrencyInput, CurrencyDisplay, type CurrencyInputOptions } from 'vue-currency-input';
import type { InputNumberProps } from '../types/form';
import { useFormField } from '../composables/useFormField';

defineOptions({
  name: 'KInputNumber',
  inheritAttrs: false,
});

const props = defineProps<InputNumberProps>();

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const { inputId, errorId, hintId, field, resolvedError, ariaDescribedBy } = useFormField<
  number | null
>(props);

const mergedOptions = computed<CurrencyInputOptions>(() => ({
  currency: 'USD',
  currencyDisplay: CurrencyDisplay.hidden,
  useGrouping: true,
  ...props.options,
}));

const { inputRef, numberValue, setValue, setOptions } = useCurrencyInput(
  mergedOptions.value,
  false,
);

const externalValue = computed<number | null>(() =>
  field ? (field.value.value ?? null) : (props.modelValue ?? null),
);

watch(
  mergedOptions,
  (newOpts) => {
    setOptions(newOpts);
  },
  { deep: true },
);

// User types → sync to field + emit
watch(numberValue, (newVal) => {
  if (newVal === externalValue.value) {
    return;
  }

  if (field) {
    field.handleChange(newVal);
  }

  emit('update:modelValue', newVal);
});

// Sync initial value once useCurrencyInput has created its CurrencyInput instance.
watch(inputRef, (el) => {
  if (el && externalValue.value !== null && externalValue.value !== numberValue.value) {
    setValue(externalValue.value);
  }
});

// External value change → sync to display
watch(externalValue, (newVal) => {
  if (newVal !== numberValue.value) {
    setValue(newVal);
  }
});

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
        ref="inputRef"
        type="text"
        inputmode="decimal"
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
