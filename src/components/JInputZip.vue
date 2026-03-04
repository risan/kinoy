<script setup lang="ts">
import JInputMask from './JInputMask.vue';

defineOptions({ name: 'JInputZip' });
</script>

<template>
  <JInputMask :mask="{ mask: '00000[-0000]' }" />
</template>
