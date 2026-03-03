import { computed, ref, watch, type Ref, type ComputedRef } from 'vue';
import { partition } from 'es-toolkit';
import Fuse from 'fuse.js';
import type { SelectOption, SelectOptionValue, OptionAccessor } from '../types/form';

function isObject(o: SelectOption): o is Record<string, unknown> {
  return typeof o === 'object' && o !== null;
}

export function useSelectOptions(deps: {
  options: Ref<SelectOption[]>;
  optionValue: Ref<OptionAccessor>;
  optionLabel: Ref<OptionAccessor>;
  local: Ref<boolean>;
  searchableFields: Ref<string[] | undefined>;
  searchQuery: Ref<string>;
}): {
  resolveValue: (option: SelectOption) => SelectOptionValue;
  resolveText: (option: SelectOption) => string;
  filteredOptions: ComputedRef<SelectOption[]>;
} {
  function resolveValue(option: SelectOption): SelectOptionValue {
    if (!isObject(option)) {
      return option as SelectOptionValue;
    }

    const accessor = deps.optionValue.value;
    if (typeof accessor === 'function') {
      return accessor(option) as SelectOptionValue;
    }

    return option[accessor] as SelectOptionValue;
  }

  function resolveText(option: SelectOption): string {
    if (!isObject(option)) {
      return String(option);
    }

    const accessor = deps.optionLabel.value;
    if (typeof accessor === 'function') {
      return accessor(option);
    }

    return String(option[accessor]);
  }

  const fuseInstance = ref<Fuse<Record<string, unknown>> | null>(null);

  watch(
    [
      () => deps.options.value,
      () => deps.local.value,
      () => deps.searchableFields.value,
      () => deps.optionLabel.value,
    ],
    () => {
      if (!deps.local.value) {
        fuseInstance.value = null;
        return;
      }

      const objects = deps.options.value.filter(isObject);

      if (objects.length === 0) {
        fuseInstance.value = null;
        return;
      }

      let keys: string[];
      if (deps.searchableFields.value) {
        keys = deps.searchableFields.value;
      } else if (typeof deps.optionLabel.value === 'string') {
        keys = [deps.optionLabel.value];
      } else {
        keys = ['label'];
      }

      fuseInstance.value = new Fuse(objects, { threshold: 0.4, keys });
    },
    { immediate: true },
  );

  const filteredOptions = computed<SelectOption[]>(() => {
    const query = deps.searchQuery.value.trim();
    if (!query || !deps.local.value) {
      return deps.options.value;
    }

    const [objects, primitives] = partition(deps.options.value, isObject);
    const lower = query.toLowerCase();

    const matchedPrimitives = primitives.filter((p) => String(p).toLowerCase().includes(lower));

    const matchedObjects = fuseInstance.value
      ? fuseInstance.value.search(query).map((r) => r.item)
      : objects;

    return [...matchedPrimitives, ...matchedObjects];
  });

  return { resolveValue, resolveText, filteredOptions };
}
