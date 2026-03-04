<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InputFileProps } from '../types/form';
import { useFormField } from '../composables/useFormField';
import IconCloudArrowUp from '../icons/IconCloudArrowUp.vue';
import IconFile from '../icons/IconFile.vue';
import IconXMark from '../icons/IconXMark.vue';

defineOptions({
  name: 'JInputFile',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputFileProps>(), {});
const emit = defineEmits<{ 'update:files': [files: File[]] }>();

const { inputId, errorId, hintId, field, resolvedError, ariaDescribedBy } =
  useFormField<File[]>(props);

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);

const isMaxReached = computed(
  () => props.maxFiles != null && selectedFiles.value.length >= props.maxFiles,
);
const isDisabled = computed(() => props.disabled || isMaxReached.value);

function updateFiles(newFiles: File[]) {
  selectedFiles.value = newFiles;
  emit('update:files', newFiles);
  field?.handleChange(newFiles);
}

function triggerFileInput() {
  if (isDisabled.value) {
    return;
  }

  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  if (files.length === 0) {
    return;
  }

  if (props.multiple) {
    const merged = [...selectedFiles.value, ...files];
    updateFiles(props.maxFiles != null ? merged.slice(0, props.maxFiles) : merged);
  } else {
    updateFiles([files[0]!]);
  }

  input.value = '';
}

const dragCounter = ref(0);
const isDragging = computed(() => dragCounter.value > 0);

function onDragEnter(e: DragEvent) {
  if (isDisabled.value) {
    return;
  }

  e.preventDefault();
  dragCounter.value++;
}

function onDragOver(e: DragEvent) {
  if (isDisabled.value) {
    return;
  }

  e.preventDefault();
}

function onDragLeave() {
  dragCounter.value = Math.max(0, dragCounter.value - 1);
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter.value = 0;
  if (isDisabled.value) {
    return;
  }

  let files = Array.from(e.dataTransfer?.files ?? []);

  if (props.accept) {
    files = files.filter((f) => matchesAccept(f, props.accept!));
  }

  if (files.length === 0) {
    return;
  }

  if (props.multiple) {
    const merged = [...selectedFiles.value, ...files];
    updateFiles(props.maxFiles != null ? merged.slice(0, props.maxFiles) : merged);
  } else {
    updateFiles([files[0]!]);
  }
}

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return file.name.toLowerCase().endsWith(token.toLowerCase());
    }
    if (token.includes('/')) {
      if (token.endsWith('/*')) {
        const prefix = token.slice(0, token.indexOf('/') + 1);
        return file.type.startsWith(prefix);
      }
      return file.type === token;
    }
    return false;
  });
}

function removeFile(index: number) {
  const updated = selectedFiles.value.filter((_, i) => i !== index);
  updateFiles(updated);
}

function onBlur() {
  field?.handleChange(selectedFiles.value);
  field?.handleBlur();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, i);
  return `${i === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

const formattedAccept = computed(() => {
  if (!props.accept) {
    return '';
  }

  return props.accept
    .split(',')
    .map((t) => {
      const token = t.trim();
      if (token.startsWith('.')) {
        return token.slice(1).toUpperCase();
      }

      if (token.endsWith('/*')) {
        const prefix = token.split('/')[0]!;
        return prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' files';
      }

      return token;
    })
    .join(', ');
});
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <label v-if="label" :for="inputId" class="text-input text-input-label font-medium">
      {{ label }}<span v-if="required" class="text-input-error ml-0.5" aria-hidden="true">*</span>
    </label>

    <div
      role="button"
      :tabindex="isDisabled ? -1 : 0"
      :aria-invalid="resolvedError ? true : undefined"
      :aria-describedby="ariaDescribedBy"
      :aria-disabled="isDisabled || undefined"
      class="flex flex-col items-center justify-center gap-2 rounded-input border-2 border-dashed bg-input-bg px-input-x py-6 text-center outline-none transition-colors duration-150"
      :class="[
        isDisabled
          ? 'cursor-not-allowed border-input-border-disabled bg-input-bg-disabled text-input-text-disabled'
          : isDragging
            ? 'border-primary bg-primary/5 cursor-pointer'
            : resolvedError
              ? 'border-input-border-error hover:border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error cursor-pointer'
              : 'border-input-border cursor-pointer hover:border-input-border-hover hover:bg-input-file-hover focus:ring-2 focus:ring-input-ring focus:border-input-border-focus',
      ]"
      @click="triggerFileInput"
      @keydown.enter.prevent="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @blur="onBlur"
    >
      <input
        v-bind="$attrs"
        :id="inputId"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="isDisabled || undefined"
        :required="required || undefined"
        class="sr-only"
        tabindex="-1"
        @change="onFileChange"
      />

      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <IconCloudArrowUp class="h-5 w-5 text-primary" />
      </div>

      <p class="text-input text-input-placeholder">
        <span class="font-medium text-primary">Click to upload</span> or drag and drop
      </p>

      <p v-if="accept" class="text-input-caption text-input-placeholder">
        {{ formattedAccept }}
      </p>
    </div>

    <span v-if="required && !label" class="shrink-0 text-input text-input-error" aria-hidden="true"
      >*</span
    >

    <p v-if="hint" :id="hintId" class="text-input-caption text-input-placeholder">
      {{ hint }}
    </p>

    <ul v-if="selectedFiles.length > 0" class="mt-1 flex flex-col gap-1.5">
      <li
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="group flex items-center gap-2.5 rounded-input border border-input-border bg-input-bg px-3 py-2 text-input transition-colors duration-150 hover:bg-input-file-hover"
      >
        <IconFile class="h-4 w-4 shrink-0 text-input-placeholder" />
        <span class="truncate text-input-text min-w-0 flex-1">{{ file.name }}</span>
        <span class="shrink-0 text-input-caption text-input-placeholder">{{
          formatFileSize(file.size)
        }}</span>
        <button
          type="button"
          :aria-label="`Remove ${file.name}`"
          class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-input-placeholder transition-colors duration-150 hover:bg-input-clear-bg-hover hover:text-input-error"
          @click.stop="removeFile(index)"
        >
          <IconXMark class="h-3.5 w-3.5" />
        </button>
      </li>
    </ul>

    <p v-if="resolvedError" :id="errorId" role="alert" class="text-input-caption text-input-error">
      {{ resolvedError }}
    </p>
  </div>
</template>
