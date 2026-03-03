<script setup lang="ts">
import { computed, useId } from 'vue';
import { useField } from 'vee-validate';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import type { DatepickerProps, DatepickerValue } from '../types/form';
import IconXMark from '../icons/IconXMark.vue';

defineOptions({
  name: 'KDatepicker',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DatepickerProps>(), {
  autoApply: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: DatepickerValue];
}>();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);
const hintId = computed(() => `${inputId.value}-hint`);

const field = props.name != null ? useField<DatepickerValue>(() => props.name!) : undefined;

const datepickerValue = computed(() =>
  field ? (field.value.value ?? null) : (props.modelValue ?? null),
);

function onDateChange(value: DatepickerValue) {
  if (field) {
    field.handleChange(value);
  }

  emit('update:modelValue', value);
}

function onBlur() {
  if (field) {
    field.handleBlur();
    field.validate();
  }
}

const resolvedError = computed(() => props.error || field?.errorMessage.value || undefined);

const ariaDescribedBy = computed(() => {
  const ids: string[] = [];
  if (props.hint) {
    ids.push(hintId.value);
  }
  if (resolvedError.value) {
    ids.push(errorId.value);
  }
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <label v-if="label" :for="inputId" class="text-input text-input-label font-medium">
      {{ label }}<span v-if="required" class="text-input-error ml-0.5" aria-hidden="true">*</span>
    </label>

    <VueDatePicker
      :time-config="{ enableTimePicker: false }"
      v-bind="$attrs"
      :model-value="datepickerValue"
      :disabled="disabled"
      :auto-apply="autoApply"
      :clearable="false"
      @update:model-value="onDateChange"
    >
      <template
        #dp-input="{
          value,
          onBlur: dpBlur,
          onFocus,
          toggleMenu,
          isMenuOpen,
          onEnter,
          onTab,
          onClear,
        }"
      >
        <div class="flex items-center gap-1">
          <div
            class="flex w-full cursor-pointer items-center rounded-input border bg-input-bg px-input-x py-input-y text-input transition-colors duration-150"
            :class="[
              disabled
                ? 'cursor-not-allowed border-input-border-disabled bg-input-bg-disabled text-input-text-disabled'
                : resolvedError
                  ? 'border-input-border-error hover:border-input-border-error focus-within:border-input-border-error focus-within:ring-2 focus-within:ring-input-ring-error'
                  : 'border-input-border hover:border-input-border-hover focus-within:border-input-border-focus focus-within:ring-2 focus-within:ring-input-ring',
            ]"
            @click.stop="toggleMenu"
          >
            <input
              :id="inputId"
              type="text"
              :value="value"
              :disabled="disabled || undefined"
              :required="required || undefined"
              readonly
              :placeholder="$attrs.placeholder as string"
              :aria-invalid="resolvedError ? true : undefined"
              :aria-describedby="ariaDescribedBy"
              :aria-disabled="disabled || undefined"
              :aria-expanded="isMenuOpen"
              aria-haspopup="dialog"
              class="min-w-0 flex-1 cursor-pointer bg-transparent text-input-text placeholder:text-input-placeholder outline-none disabled:cursor-not-allowed disabled:text-input-text-disabled"
              @focus="onFocus"
              @blur="
                () => {
                  dpBlur();
                  onBlur();
                }
              "
              @keydown.enter="onEnter"
              @keydown.tab="onTab"
            />
            <button
              v-if="datepickerValue != null && !disabled"
              type="button"
              aria-label="Clear date"
              class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-input-placeholder transition-colors duration-150 hover:bg-red-100 hover:text-input-error"
              tabindex="-1"
              @click.stop="onClear"
              @mousedown.prevent
            >
              <IconXMark class="h-3.5 w-3.5" />
            </button>
          </div>
          <span
            v-if="required && !label"
            class="shrink-0 text-input text-input-error"
            aria-hidden="true"
            >*</span
          >
        </div>
      </template>
    </VueDatePicker>

    <p v-if="hint" :id="hintId" class="text-input-caption text-input-placeholder">
      {{ hint }}
    </p>

    <p v-if="resolvedError" :id="errorId" role="alert" class="text-input-caption text-input-error">
      {{ resolvedError }}
    </p>
  </div>
</template>
