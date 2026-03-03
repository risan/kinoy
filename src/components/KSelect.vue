<script setup lang="ts">
import { computed, ref, watch, useId, nextTick } from 'vue';
import { useField } from 'vee-validate';
import type { SelectProps, SelectOption, SelectOptionValue, SelectModelValue } from '../types/form';
import { useSelectOptions } from '../composables/useSelectOptions';
import { useSelectDropdown } from '../composables/useSelectDropdown';
import { useSelectKeyboard } from '../composables/useSelectKeyboard';
import { useSelectGroups } from '../composables/useSelectGroups';
import KBadge from './KBadge.vue';
import KLoading from './KLoading.vue';
import IconXMark from '../icons/IconXMark.vue';
import IconChevronDown from '../icons/IconChevronDown.vue';

defineOptions({
  name: 'KSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: undefined,
  options: () => [],
  optionValue: 'value',
  optionLabel: 'label',
  mode: 'single',
  emptyText: 'No options found',
  objectValue: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: SelectModelValue];
  search: [query: string];
}>();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);
const hintId = computed(() => `${inputId.value}-hint`);
const listboxId = computed(() => `${inputId.value}-listbox`);

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);

const field = props.name != null ? useField<SelectModelValue>(() => props.name!) : undefined;

function getDefault(): SelectModelValue {
  return props.mode === 'single' ? null : [];
}

const currentValue = computed<SelectModelValue>(() => {
  const val = field ? field.value.value : props.modelValue;
  return val ?? getDefault();
});

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

function updateValue(newValue: SelectModelValue) {
  if (field) {
    field.handleChange(newValue);
  }

  emit('update:modelValue', newValue);
}

function onBlur() {
  field?.handleBlur();
}

const searchQuery = ref('');

const mergedOptions = computed<SelectOption[]>(() => {
  const base = props.options ?? [];
  if (props.mode !== 'tags' || !props.createOption) {
    return base;
  }

  const vals = Array.isArray(currentValue.value) ? currentValue.value : [];
  if (vals.length === 0) {
    return base;
  }

  const optionValueAccessor = props.optionValue ?? 'value';
  const optionLabelAccessor = props.optionLabel ?? 'label';

  const existingValues = new Set(
    base.map((o) => {
      if (typeof o !== 'object' || o === null) {
        return o;
      }

      if (typeof optionValueAccessor === 'function') {
        return optionValueAccessor(o);
      }

      return (o as Record<string, unknown>)[optionValueAccessor];
    }),
  );

  const hasSomeObjectOption = base.some((o) => typeof o === 'object' && o !== null);
  const extras: SelectOption[] = [];

  for (const val of vals) {
    const key = resolveModelItemValue(val as SelectOption);

    if (existingValues.has(key)) {
      continue;
    }

    if (props.objectValue && typeof val === 'object' && val !== null) {
      extras.push(val as SelectOption);
    } else if (hasSomeObjectOption) {
      const valKey = typeof optionValueAccessor === 'string' ? optionValueAccessor : 'value';
      const textKey = typeof optionLabelAccessor === 'string' ? optionLabelAccessor : 'label';
      extras.push({ [valKey]: key, [textKey]: String(key) });
    } else {
      extras.push(key as SelectOption);
    }
  }

  return extras.length > 0 ? [...base, ...extras] : base;
});

const { resolveValue, resolveText, filteredOptions } = useSelectOptions({
  options: mergedOptions,
  optionValue: computed(() => props.optionValue ?? 'value'),
  optionLabel: computed(() => props.optionLabel ?? 'label'),
  local: computed(() => props.local ?? false),
  searchableFields: computed(() => props.searchableFields),
  searchQuery,
});

function resolveModelItemValue(item: SelectOption): SelectOptionValue {
  if (typeof item !== 'object' || item === null) {
    return item as SelectOptionValue;
  }

  const accessor = props.optionValue ?? 'value';
  if (typeof accessor === 'function') {
    return accessor(item as Record<string, unknown>) as SelectOptionValue;
  }

  return (item as Record<string, unknown>)[accessor] as SelectOptionValue;
}

const { groupedOptions, isGrouped } = useSelectGroups({
  filteredOptions,
  groupBy: computed(() => props.groupBy),
});

const { isOpen, dropdownPlacement, dropdownMaxHeight, open, close, toggle } = useSelectDropdown({
  rootRef,
  triggerRef,
  disabled: computed(() => props.disabled ?? false),
});

const selectedSet = computed<Set<SelectOptionValue>>(() => {
  const val = currentValue.value;
  if (val == null) {
    return new Set();
  }

  if (Array.isArray(val)) {
    return new Set(val.map((v) => resolveModelItemValue(v as SelectOption)));
  }

  return new Set([resolveModelItemValue(val as SelectOption)]);
});

function isSelected(option: SelectOption): boolean {
  return selectedSet.value.has(resolveValue(option));
}

function findOption(value: SelectOption): SelectOption | undefined {
  const key = resolveModelItemValue(value);
  return (props.options ?? []).find((o) => resolveValue(o) === key);
}

function getSelectedText(value: SelectOption): string {
  const opt = findOption(value);
  if (opt != null) {
    return resolveText(opt);
  }

  if (typeof value === 'object' && value !== null) {
    return resolveText(value);
  }

  return String(value);
}

function selectOption(option: SelectOption) {
  const val = resolveValue(option);
  const emitted = props.objectValue ? option : val;

  if (props.mode === 'single') {
    if (isSelected(option) && props.canDeselect) {
      updateValue(null);
    } else {
      updateValue(emitted as SelectModelValue);
    }

    close();
    triggerRef.value?.focus();
  } else {
    const arr = Array.isArray(currentValue.value) ? [...currentValue.value] : [];
    const idx = arr.findIndex((v) => resolveModelItemValue(v as SelectOption) === val);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(emitted as SelectOptionValue);
    }

    updateValue(arr);
    nextTick(() => searchInputRef.value?.focus());
  }

  searchQuery.value = '';
}

function removeTag(value: SelectOption) {
  if (props.disabled) {
    return;
  }

  const key = resolveModelItemValue(value);
  const arr = Array.isArray(currentValue.value) ? [...currentValue.value] : [];
  const idx = arr.findIndex((v) => resolveModelItemValue(v as SelectOption) === key);
  if (idx >= 0) {
    arr.splice(idx, 1);
    updateValue(arr);
  }
}

function createTag() {
  const query = searchQuery.value.trim();
  if (!query || props.mode !== 'tags' || !props.createOption) {
    return false;
  }

  const arr = Array.isArray(currentValue.value) ? [...currentValue.value] : [];

  let newOption: SelectOption;
  if (typeof props.createOption === 'function') {
    newOption = props.createOption(query);
  } else {
    const hasSomeObjectOption = (props.options ?? []).some(
      (o) => typeof o === 'object' && o !== null,
    );
    if (hasSomeObjectOption) {
      const valKey = typeof props.optionValue === 'string' ? props.optionValue : 'value';
      const textKey = typeof props.optionLabel === 'string' ? props.optionLabel : 'label';
      newOption = { [valKey]: query, [textKey]: query };
    } else {
      newOption = query;
    }
  }

  const newVal = resolveValue(newOption);

  if (arr.some((v) => resolveModelItemValue(v as SelectOption) === newVal)) {
    searchQuery.value = '';
    return true;
  }

  arr.push(props.objectValue ? (newOption as SelectOptionValue) : newVal);
  updateValue(arr);
  searchQuery.value = '';
  return true;
}

const { highlightedIndex, onKeydown: baseKeydown } = useSelectKeyboard({
  isOpen,
  filteredOptions,
  open,
  close,
  select: selectOption,
  listboxRef,
});

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return;
  }

  if (props.mode === 'tags' && props.createOption && searchQuery.value.trim()) {
    if (event.key === 'Tab' || event.key === ',') {
      event.preventDefault();
      createTag();
      return;
    }

    if (event.key === 'Enter' && highlightedIndex.value < 0) {
      event.preventDefault();
      createTag();
      return;
    }
  }

  if (event.key === 'Tab' && isOpen.value) {
    close();
    return;
  }

  baseKeydown(event);
}

watch(searchQuery, (query) => {
  if (!props.local && query) {
    emit('search', query);
  }
});

watch(isOpen, (val) => {
  if (!val) {
    searchQuery.value = '';
  } else {
    nextTick(() => searchInputRef.value?.focus());
  }
});

function onTriggerClick() {
  if (props.disabled) {
    return;
  }

  toggle();
}

function onTriggerBlur(event: FocusEvent) {
  const related = event.relatedTarget as HTMLElement | null;
  if (related && rootRef.value?.contains(related)) {
    return;
  }

  onBlur();
}

function clear() {
  updateValue(getDefault());
  searchQuery.value = '';
}

const hasValue = computed(() => {
  const val = currentValue.value;
  if (val == null) {
    return false;
  }

  if (Array.isArray(val)) {
    return val.length > 0;
  }

  return true;
});

const showClear = computed(() => !props.hideClear && !props.disabled && hasValue.value);

const highlightedOptionId = computed(() =>
  highlightedIndex.value >= 0 ? `${listboxId.value}-option-${highlightedIndex.value}` : undefined,
);

const isMultiMode = computed(() => props.mode === 'multiple' || props.mode === 'tags');

const canCreateFromQuery = computed(() => {
  if (props.mode !== 'tags' || !props.createOption) {
    return false;
  }

  return searchQuery.value.trim().length > 0;
});

const displayText = computed(() => {
  if (props.mode !== 'single' || currentValue.value == null) {
    return '';
  }

  return getSelectedText(currentValue.value as SelectOption);
});

const selectedValues = computed<SelectOption[]>(() => {
  if (!isMultiMode.value) {
    return [];
  }

  return Array.isArray(currentValue.value) ? (currentValue.value as SelectOption[]) : [];
});

defineExpose({ clear });
</script>

<template>
  <div ref="rootRef" class="flex flex-col gap-0.5">
    <label v-if="label" :for="inputId" class="text-input text-input-label font-medium">
      {{ label }}<span v-if="required" class="text-input-error ml-0.5" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <div
        v-bind="$attrs"
        :id="inputId"
        ref="triggerRef"
        role="combobox"
        :tabindex="disabled ? -1 : 0"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="highlightedOptionId"
        aria-haspopup="listbox"
        :aria-required="required || undefined"
        :aria-invalid="resolvedError ? true : undefined"
        :aria-describedby="ariaDescribedBy"
        :aria-disabled="disabled || undefined"
        :aria-multiselectable="isMultiMode || undefined"
        class="relative flex w-full cursor-pointer items-center gap-1 rounded-input border bg-input-bg px-input-x py-input-y text-input text-input-text outline-none transition-colors duration-150 disabled:cursor-not-allowed"
        :class="[
          disabled
            ? 'cursor-not-allowed border-input-border-disabled bg-input-bg-disabled text-input-text-disabled'
            : resolvedError
              ? 'border-input-border-error hover:border-input-border-error focus:border-input-border-error focus:ring-2 focus:ring-input-ring-error'
              : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-2 focus:ring-input-ring',
        ]"
        @click="onTriggerClick"
        @keydown="onKeydown"
        @blur="onTriggerBlur"
      >
        <template v-if="mode === 'single'">
          <input
            v-if="isOpen && !disableSearch"
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="min-w-0 flex-1 bg-transparent text-input text-input-text placeholder:text-input-placeholder outline-none"
            :placeholder="displayText || placeholder"
            autocomplete="off"
            @click.stop
          />
          <span v-else class="min-w-0 flex-1 truncate">
            <template v-if="hasValue">
              <slot
                name="selected-option"
                :option="findOption(currentValue as SelectOption) ?? currentValue"
              >
                {{ displayText }}
              </slot>
            </template>
            <span v-if="!hasValue" class="text-input-placeholder">{{ placeholder }}</span>
          </span>
        </template>

        <template v-else>
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            <slot
              v-for="val in selectedValues"
              :key="String(resolveModelItemValue(val))"
              name="tag"
              :option="findOption(val) ?? val"
              :remove="() => removeTag(val)"
            >
              <KBadge
                size="sm"
                removable
                :remove-label="`Remove ${getSelectedText(val)}`"
                class="bg-select-tag-bg text-select-tag-text"
                @remove="removeTag(val)"
              >
                <slot name="selected-option" :option="findOption(val) ?? val">
                  {{ getSelectedText(val) }}
                </slot>
              </KBadge>
            </slot>
            <input
              v-if="!disableSearch"
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="min-w-[3rem] flex-1 bg-transparent text-input text-input-text placeholder:text-input-placeholder outline-none"
              :placeholder="selectedValues.length === 0 ? placeholder : ''"
              :disabled="disabled || undefined"
              autocomplete="off"
              @click.stop="open"
            />
            <span v-else-if="selectedValues.length === 0" class="text-input-placeholder">
              {{ placeholder }}
            </span>
          </div>
        </template>

        <div class="flex shrink-0 items-center gap-1 pl-1">
          <KLoading v-if="loading" size="xs" color="muted" label="Loading options" />
          <button
            v-if="showClear"
            type="button"
            aria-label="Clear selection"
            class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-input-placeholder transition-colors duration-150 hover:bg-red-100 hover:text-input-error"
            tabindex="-1"
            @click.stop="clear"
            @mousedown.prevent
          >
            <IconXMark class="h-3.5 w-3.5" />
          </button>
          <IconChevronDown
            :class="[
              'h-3.5 w-3.5 text-input-placeholder transition-transform duration-150',
              { 'rotate-180': isOpen },
            ]"
          />
        </div>
      </div>

      <div
        v-show="isOpen"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        :aria-multiselectable="isMultiMode || undefined"
        class="absolute z-50 w-full overflow-auto rounded-input border border-select-dropdown-border bg-select-dropdown-bg shadow-select-dropdown"
        :class="[dropdownPlacement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1']"
        :style="{ maxHeight: dropdownMaxHeight }"
      >
        <div
          v-if="!disableSearch && mode === 'multiple'"
          class="sticky top-0 border-b border-select-dropdown-border bg-select-dropdown-bg p-1.5"
        >
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full rounded-md border border-input-border bg-input-bg px-2 py-1 text-input text-input-text placeholder:text-input-placeholder outline-none focus:border-input-border-focus"
            placeholder="Search..."
            autocomplete="off"
            @keydown="onKeydown"
          />
        </div>

        <ul class="py-1">
          <template v-for="(group, gi) in groupedOptions" :key="group.label ?? `__ungrouped_${gi}`">
            <li
              v-if="isGrouped && group.label != null"
              role="presentation"
              class="px-input-x py-1.5 text-xs font-semibold tracking-wide text-input-placeholder uppercase select-none"
            >
              <slot name="group-label" :group="group.label" :options="group.options">
                {{ group.label }}
              </slot>
            </li>
            <li
              v-for="(option, oi) in group.options"
              :id="`${listboxId}-option-${group.startIndex + oi}`"
              :key="String(resolveValue(option))"
              role="option"
              :aria-selected="isSelected(option)"
              :data-highlighted="highlightedIndex === group.startIndex + oi || undefined"
              class="cursor-pointer px-input-x py-1.5 text-input transition-colors duration-75"
              :class="[
                highlightedIndex === group.startIndex + oi
                  ? 'bg-select-option-hover'
                  : isSelected(option)
                    ? 'bg-select-option-selected'
                    : 'hover:bg-select-option-hover',
              ]"
              @mousedown.prevent="selectOption(option)"
              @mouseenter="highlightedIndex = group.startIndex + oi"
            >
              <slot name="option" :option="option" :selected="isSelected(option)">
                {{ resolveText(option) }}
              </slot>
            </li>
          </template>
        </ul>

        <div
          v-if="filteredOptions.length === 0"
          class="px-input-x py-3 text-center text-input text-input-placeholder"
        >
          <template v-if="canCreateFromQuery">
            Press
            <kbd
              class="rounded border border-input-border bg-input-bg px-1 py-0.5 text-xs font-semibold"
              >Tab</kbd
            >
            or
            <kbd
              class="rounded border border-input-border bg-input-bg px-1 py-0.5 text-xs font-semibold"
              >Enter</kbd
            >
            to add "<span class="font-medium text-input-text">{{ searchQuery.trim() }}</span
            >"
          </template>
          <template v-else>
            {{ emptyText }}
          </template>
        </div>
      </div>
    </div>

    <span v-if="required && !label" class="shrink-0 text-input text-input-error" aria-hidden="true"
      >*</span
    >

    <p v-if="hint" :id="hintId" class="text-input-caption text-input-placeholder">
      {{ hint }}
    </p>

    <p v-if="resolvedError" :id="errorId" role="alert" class="text-input-caption text-input-error">
      {{ resolvedError }}
    </p>
  </div>
</template>
