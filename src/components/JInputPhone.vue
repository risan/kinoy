<script setup lang="ts">
import JInputMask from './JInputMask.vue';

defineOptions({ name: 'JInputPhone' });
</script>

<template>
  <JInputMask :mask="{ mask: '000-000-0000' }" />
</template>
