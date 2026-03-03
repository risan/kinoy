import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { onClickOutside, useElementBounding } from '@vueuse/core';

export const DROPDOWN_MAX_HEIGHT = 256;

export function useSelectDropdown(deps: {
  rootRef: Ref<HTMLElement | null>;
  triggerRef: Ref<HTMLElement | null>;
  disabled: Ref<boolean>;
}): {
  isOpen: Ref<boolean>;
  dropdownPlacement: ComputedRef<'below' | 'above'>;
  dropdownMaxHeight: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
} {
  const isOpen = ref(false);

  function open() {
    if (deps.disabled.value) {
      return;
    }

    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function toggle() {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  onClickOutside(deps.rootRef, close);

  const { bottom, top } = useElementBounding(deps.triggerRef);

  const dropdownPlacement = computed<'below' | 'above'>(() => {
    const maxHeight = DROPDOWN_MAX_HEIGHT;
    if (
      typeof window !== 'undefined' &&
      window.innerHeight - bottom.value < maxHeight &&
      top.value > maxHeight
    ) {
      return 'above';
    }

    return 'below';
  });

  const dropdownMaxHeight = `${DROPDOWN_MAX_HEIGHT}px`;

  return { isOpen, dropdownPlacement, dropdownMaxHeight, open, close, toggle };
}
