<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { ButtonProps, LoadingSize } from '../types/form';
import JLoading from './JLoading.vue';

defineOptions({
  name: 'JButton',
  inheritAttrs: false,
});

const attrs = useAttrs();

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  loadingLabel: 'Loading...',
});

const tag = computed(() => (props.href ? 'a' : 'button'));
const isInteractive = computed(() => !props.disabled && !props.loading);

const spinnerSizeMap: Record<string, LoadingSize> = { sm: 'xs', md: 'sm', lg: 'md' };
const spinnerSize = computed<LoadingSize>(() => spinnerSizeMap[props.size] ?? 'sm');

const baseClasses =
  'inline-flex items-center justify-center font-medium rounded-input outline-none transition-colors duration-150 select-none';

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };
  return map[props.size];
});

const variantClasses = computed(() => {
  if (!isInteractive.value) {
    if (props.variant === 'outline') {
      return 'bg-transparent border border-btn-disabled-border text-btn-disabled-text cursor-not-allowed';
    }
    if (props.variant === 'ghost') {
      return 'bg-transparent text-btn-disabled-text cursor-not-allowed';
    }
    return 'bg-btn-disabled-bg text-btn-disabled-text border-btn-disabled-border cursor-not-allowed';
  }

  const map: Record<string, string> = {
    default:
      'bg-btn-default-bg text-btn-default-text hover:bg-btn-default-bg-hover active:bg-btn-default-bg-active focus-visible:ring-2 focus-visible:ring-btn-default-ring',
    primary:
      'bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active focus-visible:ring-2 focus-visible:ring-btn-primary-ring',
    secondary:
      'bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-bg-hover active:bg-btn-secondary-bg-active focus-visible:ring-2 focus-visible:ring-btn-secondary-ring',
    success:
      'bg-btn-success-bg text-btn-success-text hover:bg-btn-success-bg-hover active:bg-btn-success-bg-active focus-visible:ring-2 focus-visible:ring-btn-success-ring',
    warning:
      'bg-btn-warning-bg text-btn-warning-text hover:bg-btn-warning-bg-hover active:bg-btn-warning-bg-active focus-visible:ring-2 focus-visible:ring-btn-warning-ring',
    info: 'bg-btn-info-bg text-btn-info-text hover:bg-btn-info-bg-hover active:bg-btn-info-bg-active focus-visible:ring-2 focus-visible:ring-btn-info-ring',
    outline:
      'bg-transparent border border-btn-outline-border text-btn-outline-text hover:bg-btn-outline-bg-hover hover:border-btn-outline-border-hover active:bg-btn-outline-bg-active focus-visible:ring-2 focus-visible:ring-btn-outline-ring',
    ghost:
      'bg-transparent text-btn-ghost-text hover:bg-btn-ghost-bg-hover active:bg-btn-ghost-bg-active focus-visible:ring-2 focus-visible:ring-btn-ghost-ring',
    danger:
      'bg-btn-danger-bg text-btn-danger-text hover:bg-btn-danger-bg-hover active:bg-btn-danger-bg-active focus-visible:ring-2 focus-visible:ring-btn-danger-ring',
  };
  return map[props.variant];
});

const passAttrs = computed(() => {
  if (isInteractive.value) {
    return attrs;
  }

  const filtered: Record<string, unknown> = {};
  for (const key in attrs) {
    if (key !== 'onClick' && key !== 'onClickCapture') {
      filtered[key] = attrs[key];
    }
  }

  return filtered;
});

function handleClick(e: Event) {
  if (!isInteractive.value) {
    e.preventDefault();
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="passAttrs"
    :class="[baseClasses, sizeClasses, variantClasses]"
    :type="tag === 'button' ? type : undefined"
    :href="href"
    :role="tag === 'a' ? 'button' : undefined"
    :disabled="tag === 'button' && !isInteractive ? true : undefined"
    :aria-disabled="!isInteractive ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :tabindex="tag === 'a' && !isInteractive ? '-1' : undefined"
    @click="handleClick"
  >
    <JLoading v-if="loading" :size="spinnerSize" color="current" :label="loadingLabel" />
    <slot v-if="!loading" name="icon-left" />
    <slot>{{ label }}</slot>
    <slot name="icon-right" />
  </component>
</template>
