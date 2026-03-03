<script setup lang="ts">
import KInputMask from './KInputMask.vue';

defineOptions({ name: 'KInputPhone' });
</script>

<template>
  <KInputMask :mask="{ mask: '000-000-0000' }" />
</template>
