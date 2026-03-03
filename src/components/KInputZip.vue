<script setup lang="ts">
import KInputMask from './KInputMask.vue';

defineOptions({ name: 'KInputZip' });
</script>

<template>
  <KInputMask :mask="{ mask: '00000[-0000]' }" />
</template>
