# kinoy

A Vue 3 component library with Tailwind v4 theming.

## Installation

```bash
bun add kinoy
bun add vue tailwindcss         # required peers
bun add vee-validate             # optional, for form validation
bun add @vuepic/vue-datepicker   # optional, for KDatepicker
```

## Setup

```css
/* main.css */
@import 'tailwindcss';
@import 'kinoy/theme';
@source "../node_modules/kinoy/dist";
```

## Usage

```vue
<script setup>
import { KButton, KInput } from 'kinoy'
</script>

<template>
  <KInput label="Name" v-model="name" />
  <KButton variant="primary" label="Submit" />
</template>
```
