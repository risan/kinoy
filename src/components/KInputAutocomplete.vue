<script setup lang="ts">
import { computed, ref, watch, useId, onBeforeUnmount, nextTick } from 'vue';
import { useField } from 'vee-validate';
import { useElementBounding } from '@vueuse/core';
import type { InputAutocompleteProps, AutocompleteOption } from '../types/form';
import KLoading from './KLoading.vue';

defineOptions({
  name: 'KInputAutocomplete',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputAutocompleteProps>(), {
  optionLabel: 'label',
  optionValue: 'label',
  debounce: 300,
  minLength: 1,
  helpText: 'Start typing to search...',
  noResultsText: 'No results found',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [value: string, option: AutocompleteOption];
}>();

// ── IDs ──────────────────────────────────────────────────

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);
const hintId = computed(() => `${inputId.value}-hint`);
const listboxId = computed(() => `${inputId.value}-listbox`);

// ── Refs ─────────────────────────────────────────────────

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);

// ── vee-validate ─────────────────────────────────────────

const field = props.name != null ? useField<string>(() => props.name!) : undefined;

const inputValue = computed(() => (field ? (field.value.value ?? '') : (props.modelValue ?? '')));

function updateValue(newValue: string) {
  if (field) {
    field.handleChange(newValue);
  }

  emit('update:modelValue', newValue);
}

function onBlur() {
  field?.handleBlur();
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

// ── Search state ─────────────────────────────────────────

const options = ref<AutocompleteOption[]>([]);
const loading = ref(false);
const hasSearched = ref(false);
const inputFocused = ref(false);
const dropdownDismissed = ref(false);
const highlightedIndex = ref(-1);
let searchCounter = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ── Dropdown positioning ─────────────────────────────────

const DROPDOWN_MAX_HEIGHT = 256;

const { bottom, top } = useElementBounding(inputRef);

const dropdownPlacement = computed<'below' | 'above'>(() => {
  if (
    typeof window !== 'undefined' &&
    window.innerHeight - bottom.value < DROPDOWN_MAX_HEIGHT &&
    top.value > DROPDOWN_MAX_HEIGHT
  ) {
    return 'above';
  }

  return 'below';
});

const showDropdown = computed(() => {
  if (!inputFocused.value || props.disabled || dropdownDismissed.value) {
    return false;
  }

  if (loading.value) {
    return true;
  }

  if (options.value.length > 0) {
    return true;
  }

  if (hasSearched.value) {
    return true;
  }

  return !!props.helpText;
});

const highlightedOptionId = computed(() =>
  highlightedIndex.value >= 0 ? `${listboxId.value}-option-${highlightedIndex.value}` : undefined,
);

// ── Option resolvers ─────────────────────────────────────

function resolveLabel(option: AutocompleteOption): string {
  if (typeof option === 'string') {
    return option;
  }

  const accessor = props.optionLabel;

  if (typeof accessor === 'function') {
    return accessor(option);
  }

  return String(option[accessor] ?? '');
}

// ── Search logic ─────────────────────────────────────────

function doSearch(query: string) {
  if (debounceTimer != null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (!query || query.trim().length < props.minLength) {
    ++searchCounter;
    options.value = [];
    hasSearched.value = false;
    loading.value = false;
    return;
  }

  loading.value = true;

  debounceTimer = setTimeout(async () => {
    const counter = ++searchCounter;

    try {
      const results = await props.search(query);

      if (counter === searchCounter) {
        options.value = results;
        hasSearched.value = true;
      }
    } catch {
      if (counter === searchCounter) {
        options.value = [];
        hasSearched.value = true;
      }
    } finally {
      if (counter === searchCounter) {
        loading.value = false;
      }
    }
  }, props.debounce);
}

onBeforeUnmount(() => {
  if (debounceTimer != null) {
    clearTimeout(debounceTimer);
  }
});

// ── Input handling ───────────────────────────────────────

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  dropdownDismissed.value = false;
  updateValue(value);
  doSearch(value);
}

function onFocus() {
  inputFocused.value = true;
  dropdownDismissed.value = false;
}

function onInputBlur() {
  inputFocused.value = false;
  onBlur();
}

// ── Selection ────────────────────────────────────────────

async function selectOption(option: AutocompleteOption) {
  dropdownDismissed.value = true;
  options.value = [];
  hasSearched.value = false;
  highlightedIndex.value = -1;

  try {
    let value: string;

    if (typeof option === 'string') {
      value = option;
    } else {
      const accessor = props.optionValue;

      if (typeof accessor === 'function') {
        const result = accessor(option);
        value = result instanceof Promise ? await result : result;
      } else {
        value = String(option[accessor] ?? '');
      }
    }

    updateValue(value);
    emit('select', value, option);
  } catch {
    updateValue(resolveLabel(option));
  }
}

// ── Keyboard ─────────────────────────────────────────────

function onKeydown(event: KeyboardEvent) {
  const count = options.value.length;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (count > 0) {
        highlightedIndex.value = (highlightedIndex.value + 1) % count;
      }

      break;

    case 'ArrowUp':
      event.preventDefault();
      if (count > 0) {
        highlightedIndex.value =
          highlightedIndex.value < 0 ? count - 1 : (highlightedIndex.value - 1 + count) % count;
      }

      break;

    case 'Enter': {
      const option = options.value[highlightedIndex.value];

      if (highlightedIndex.value >= 0 && option != null) {
        event.preventDefault();
        selectOption(option);
      }

      break;
    }

    case 'Escape':
      if (showDropdown.value) {
        event.preventDefault();
        dropdownDismissed.value = true;
        options.value = [];
        hasSearched.value = false;
        highlightedIndex.value = -1;
      }

      break;
  }
}

watch(highlightedIndex, async (index) => {
  if (index < 0) {
    return;
  }

  await nextTick();
  const el = listboxRef.value?.querySelector('[data-highlighted]');
  el?.scrollIntoView?.({ block: 'nearest' });
});

watch(options, () => {
  highlightedIndex.value = -1;
});
</script>

<template>
  <div ref="rootRef" class="flex flex-col gap-0.5">
    <label v-if="label" :for="inputId" class="text-input text-input-label font-medium">
      {{ label }}<span v-if="required" class="text-input-error ml-0.5" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <div class="flex items-center gap-1">
        <input
          v-bind="$attrs"
          :id="inputId"
          ref="inputRef"
          role="combobox"
          type="text"
          :value="inputValue"
          :disabled="disabled || undefined"
          :required="required || undefined"
          :aria-invalid="resolvedError ? true : undefined"
          :aria-describedby="ariaDescribedBy"
          :aria-disabled="disabled || undefined"
          :aria-expanded="showDropdown"
          :aria-controls="showDropdown ? listboxId : undefined"
          :aria-activedescendant="highlightedOptionId"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autocomplete="off"
          class="w-full rounded-input border bg-input-bg px-input-x py-input-y text-input text-input-text placeholder:text-input-placeholder outline-none transition-colors duration-150 focus:ring-2 disabled:cursor-not-allowed disabled:border-input-border-disabled disabled:bg-input-bg-disabled disabled:text-input-text-disabled"
          :class="
            resolvedError
              ? 'border-input-border-error hover:border-input-border-error focus:border-input-border-error focus:ring-input-ring-error'
              : 'border-input-border hover:border-input-border-hover focus:border-input-border-focus focus:ring-input-ring'
          "
          @input="onInput"
          @focus="onFocus"
          @blur="onInputBlur"
          @keydown="onKeydown"
        />
        <span
          v-if="required && !label"
          class="shrink-0 text-input text-input-error"
          aria-hidden="true"
          >*</span
        >
      </div>

      <div
        v-show="showDropdown"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        class="absolute z-50 w-full overflow-auto rounded-input border border-select-dropdown-border bg-select-dropdown-bg shadow-select-dropdown"
        :class="[dropdownPlacement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1']"
        :style="{ maxHeight: `${DROPDOWN_MAX_HEIGHT}px` }"
        @mousedown.prevent
      >
        <div v-if="loading" class="flex items-center gap-2 px-input-x py-3">
          <KLoading size="xs" color="muted" label="Searching" />
          <span class="text-input text-input-placeholder">Searching...</span>
        </div>

        <ul v-else-if="options.length > 0" class="py-1">
          <li
            v-for="(option, idx) in options"
            :id="`${listboxId}-option-${idx}`"
            :key="idx"
            role="option"
            :aria-selected="highlightedIndex === idx"
            :data-highlighted="highlightedIndex === idx || undefined"
            class="cursor-pointer px-input-x py-1.5 text-input transition-colors duration-75"
            :class="[
              highlightedIndex === idx ? 'bg-select-option-hover' : 'hover:bg-select-option-hover',
            ]"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="highlightedIndex = idx"
          >
            <slot name="option" :option="option">
              {{ resolveLabel(option) }}
            </slot>
          </li>
        </ul>

        <div v-else class="px-input-x py-3 text-center text-input text-input-placeholder">
          {{ hasSearched ? noResultsText : helpText }}
        </div>
      </div>
    </div>

    <p v-if="hint" :id="hintId" class="text-input-caption text-input-placeholder">
      {{ hint }}
    </p>

    <p v-if="resolvedError" :id="errorId" role="alert" class="text-input-caption text-input-error">
      {{ resolvedError }}
    </p>
  </div>
</template>
