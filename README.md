# @jbandassociates/jbw-ui

A Vue 3 component library with Tailwind v4 theming.

## Authentication

Create a GitHub PAT (fine-grained) with `read:packages` scope for the `jbandassociates` org.

Add to your project's `.npmrc`:

```
@jbandassociates:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Installation

```bash
bun add @jbandassociates/jbw-ui
bun add vue tailwindcss         # required peers
bun add vee-validate             # optional, for form validation
bun add @vuepic/vue-datepicker   # optional, for JDatepicker
```

## Setup

```css
/* main.css */
@import 'tailwindcss';
@import '@jbandassociates/jbw-ui/theme';
@source "../node_modules/@jbandassociates/jbw-ui/dist";
```

## Usage

```vue
<script setup>
import { JButton, JInput } from '@jbandassociates/jbw-ui'
</script>

<template>
  <JInput label="Name" v-model="name" />
  <JButton variant="primary" label="Submit" />
</template>
```

Or global registration:

```ts
import { JbwUiPlugin } from '@jbandassociates/jbw-ui'
app.use(JbwUiPlugin)
```

## CI Setup

```yaml
- run: bun install --frozen-lockfile
  env:
    GITHUB_TOKEN: ${{ secrets.JBW_UI_READ_TOKEN }}
```
