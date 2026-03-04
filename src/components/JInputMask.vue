<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import IMask from 'imask';
import type { InputMask, FactoryArg, UpdateOpts } from 'imask';
import type { InputMaskProps } from '../types/form';
import { useFormField } from '../composables/useFormField';

defineOptions({
  name: 'JInputMask',
  inheritAttrs: false,
});

const props = defineProps<InputMaskProps>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { inputId, errorId, hintId, field, resolvedError, ariaDescribedBy } = useFormField(props);

const inputRef = ref<HTMLInputElement | null>(null);
let maskInstance: InputMask<FactoryArg> | null = null;

function getMaskValue(): string {
  if (!maskInstance) {
    return '';
  }

  return props.unmask ? maskInstance.unmaskedValue : maskInstance.value;
}

function syncToMask(value: string | undefined) {
  if (!maskInstance) {
    return;
  }

  const val = value ?? '';

  if (props.unmask) {
    maskInstance.unmaskedValue = val;
  } else {
    maskInstance.value = val;
  }
}

const externalValue = computed(() =>
  field ? (field.value.value ?? '') : (props.modelValue ?? ''),
);

onMounted(() => {
  if (!inputRef.value) {
    return;
  }

  maskInstance = IMask(inputRef.value, props.mask);

  syncToMask(externalValue.value);

  maskInstance.on('accept', () => {
    const value = getMaskValue();
    const currentExternal = externalValue.value;

    if (value === currentExternal) {
      return;
    }

    if (field) {
      field.handleChange(value);
    }

    emit('update:modelValue', value);
  });
});

watch(externalValue, (newVal) => {
  if (!maskInstance) {
    return;
  }

  if (newVal !== getMaskValue()) {
    syncToMask(newVal);
  }
});

watch(
  () => props.mask,
  (newMask) => {
    if (maskInstance) {
      maskInstance.updateOptions(newMask as UpdateOpts<FactoryArg>);
    }
  },
  { deep: true },
);

function onBlur() {
  field?.handleBlur();
}

onBeforeUnmount(() => {
  if (maskInstance) {
    maskInstance.destroy();
    maskInstance = null;
  }
});
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
