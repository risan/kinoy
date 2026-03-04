import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync } from 'node:fs';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

function copyThemeCss() {
  return {
    name: 'copy-theme-css',
    closeBundle() {
      const src = resolve(__dirname, 'src/theme');
      const dest = resolve(__dirname, 'dist/theme');
      mkdirSync(dest, { recursive: true });
      copyFileSync(resolve(src, 'default.css'), resolve(dest, 'default.css'));
      copyFileSync(resolve(src, 'datepicker.css'), resolve(dest, 'datepicker.css'));
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true,
    }),
    copyThemeCss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'JbwUi',
      fileName: 'jbw-ui',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'vee-validate', '@vuepic/vue-datepicker', '@googlemaps/js-api-loader'],
      output: {
        globals: {
          vue: 'Vue',
          'vee-validate': 'VeeValidate',
          '@vuepic/vue-datepicker': 'VueDatePicker',
          '@googlemaps/js-api-loader': 'GoogleMapsJsApiLoader',
        },
      },
    },
    sourcemap: true,
  },
});
