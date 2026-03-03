import { ref, watch, nextTick, type Ref, type ComputedRef } from 'vue';
import type { SelectOption } from '../types/form';

export function useSelectKeyboard(deps: {
  isOpen: Ref<boolean>;
  filteredOptions: ComputedRef<SelectOption[]>;
  open: () => void;
  close: () => void;
  select: (option: SelectOption) => void;
  listboxRef: Ref<HTMLElement | null>;
}): {
  highlightedIndex: Ref<number>;
  onKeydown: (event: KeyboardEvent) => void;
} {
  const highlightedIndex = ref(-1);

  watch(
    () => deps.isOpen.value,
    (open) => {
      if (!open) {
        highlightedIndex.value = -1;
      }
    },
  );

  watch(
    () => deps.filteredOptions.value,
    () => {
      highlightedIndex.value = -1;
    },
  );

  watch(highlightedIndex, async (index) => {
    if (index < 0) {
      return;
    }

    await nextTick();
    const el = deps.listboxRef.value?.querySelector('[data-highlighted]');
    el?.scrollIntoView?.({ block: 'nearest' });
  });

  function onKeydown(event: KeyboardEvent) {
    const count = deps.filteredOptions.value.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!deps.isOpen.value) {
          deps.open();
        } else if (count > 0) {
          highlightedIndex.value = (highlightedIndex.value + 1) % count;
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!deps.isOpen.value) {
          deps.open();
        } else if (count > 0) {
          highlightedIndex.value =
            highlightedIndex.value < 0 ? count - 1 : (highlightedIndex.value - 1 + count) % count;
        }
        break;

      case 'Home':
        if (deps.isOpen.value) {
          event.preventDefault();
          highlightedIndex.value = 0;
        }
        break;

      case 'End':
        if (deps.isOpen.value && count > 0) {
          event.preventDefault();
          highlightedIndex.value = count - 1;
        }
        break;

      case 'Enter': {
        const option = deps.filteredOptions.value[highlightedIndex.value];
        if (deps.isOpen.value && highlightedIndex.value >= 0 && option != null) {
          event.preventDefault();
          deps.select(option);
        }
        break;
      }

      case 'Escape':
        if (deps.isOpen.value) {
          event.preventDefault();
          deps.close();
        }
        break;
    }
  }

  return { highlightedIndex, onKeydown };
}
