<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { BadgeProps } from '../types/form';
import IconXMark from '../icons/IconXMark.vue';

defineOptions({
  name: 'KBadge',
  inheritAttrs: false,
});

const attrs = useAttrs();

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md',
  removable: false,
  removeLabel: 'Remove',
  pill: false,
  dot: false,
});

const emit = defineEmits<{ remove: [] }>();

const baseClasses = 'inline-flex items-center font-medium';

const shapeClass = computed(() => (props.pill ? 'rounded-full' : 'rounded-md'));

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-1.5',
  };

  return map[props.size];
});

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    default: 'bg-badge-default-bg text-badge-default-text',
    primary: 'bg-badge-primary-bg text-badge-primary-text',
    secondary: 'bg-badge-secondary-bg text-badge-secondary-text',
    success: 'bg-badge-success-bg text-badge-success-text',
    warning: 'bg-badge-warning-bg text-badge-warning-text',
    danger: 'bg-badge-danger-bg text-badge-danger-text',
    info: 'bg-badge-info-bg text-badge-info-text',
    outline: 'bg-transparent border border-badge-outline-border text-badge-outline-text',
    ghost: 'bg-transparent text-badge-ghost-text',
  };

  return map[props.variant];
});

const dotClasses = computed(() => {
  const map: Record<string, string> = {
    default: 'bg-badge-default-dot',
    primary: 'bg-badge-primary-dot',
    secondary: 'bg-badge-secondary-dot',
    success: 'bg-badge-success-dot',
    warning: 'bg-badge-warning-dot',
    danger: 'bg-badge-danger-dot',
    info: 'bg-badge-info-dot',
    outline: 'bg-badge-outline-dot',
    ghost: 'bg-badge-ghost-dot',
  };

  return map[props.variant];
});
</script>

<template>
  <span v-bind="attrs" :class="[baseClasses, shapeClass, sizeClasses, variantClasses]" :role="role">
    <span
      v-if="dot"
      data-testid="badge-dot"
      aria-hidden="true"
      :class="['inline-block h-1.5 w-1.5 shrink-0 rounded-full', dotClasses]"
    />
    <slot name="icon-left" />
    <slot>{{ label }}</slot>
    <slot name="icon-right" />
    <button
      v-if="removable"
      type="button"
      :aria-label="removeLabel"
      class="flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded text-badge-remove transition-colors duration-150 hover:bg-red-100 hover:text-badge-remove-hover"
      tabindex="-1"
      @click.stop="emit('remove')"
      @mousedown.prevent
    >
      <IconXMark class="h-2.5 w-2.5" />
    </button>
  </span>
</template>
