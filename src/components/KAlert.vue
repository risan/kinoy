<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import type { AlertProps } from '../types/form';
import IconXMark from '../icons/IconXMark.vue';
import IconCircleInfo from '../icons/IconCircleInfo.vue';
import IconCircleCheck from '../icons/IconCircleCheck.vue';
import IconTriangleExclamation from '../icons/IconTriangleExclamation.vue';
import IconCircleXMark from '../icons/IconCircleXMark.vue';

defineOptions({
  name: 'KAlert',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'default',
  dismissible: false,
  closeLabel: 'Close',
});

const emit = defineEmits<{ close: [] }>();

const visible = ref(true);

const baseClasses = 'flex items-start rounded-lg border px-3 py-2.5 gap-2';

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    default: 'bg-alert-default-bg text-alert-default-text border-alert-default-border',
    success: 'bg-alert-success-bg text-alert-success-text border-alert-success-border',
    warning: 'bg-alert-warning-bg text-alert-warning-text border-alert-warning-border',
    danger: 'bg-alert-danger-bg text-alert-danger-text border-alert-danger-border',
    info: 'bg-alert-info-bg text-alert-info-text border-alert-info-border',
  };
  return map[props.variant];
});

const iconColorClasses = computed(() => {
  const map: Record<string, string> = {
    default: 'text-alert-default-icon',
    success: 'text-alert-success-icon',
    warning: 'text-alert-warning-icon',
    danger: 'text-alert-danger-icon',
    info: 'text-alert-info-icon',
  };
  return map[props.variant];
});

const defaultIcons: Record<string, Component> = {
  default: IconCircleInfo,
  success: IconCircleCheck,
  warning: IconTriangleExclamation,
  danger: IconCircleXMark,
  info: IconCircleInfo,
};

const resolvedIcon = computed(() => defaultIcons[props.variant]);

function handleClose() {
  visible.value = false;
  emit('close');
}
</script>

<template>
  <div v-if="visible" v-bind="$attrs" role="alert" :class="[baseClasses, variantClasses]">
    <span
      data-testid="alert-icon"
      aria-hidden="true"
      :class="['mt-0.5 shrink-0', iconColorClasses]"
    >
      <slot name="icon">
        <component :is="resolvedIcon" class="h-5 w-5" />
      </slot>
    </span>
    <div class="min-w-0 flex-1">
      <slot>
        <p v-if="title || $slots.title" class="font-medium">
          <slot name="title">{{ title }}</slot>
        </p>
        <p v-if="description || $slots.description" class="mt-0.5 text-sm">
          <slot name="description">{{ description }}</slot>
        </p>
      </slot>
    </div>
    <button
      v-if="dismissible"
      type="button"
      :aria-label="closeLabel"
      class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-current opacity-50 transition-opacity duration-150 hover:opacity-100"
      @click="handleClose"
    >
      <IconXMark class="h-4 w-4" />
    </button>
  </div>
</template>
