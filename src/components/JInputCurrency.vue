<script setup lang="ts">
import { computed } from 'vue';
import { CurrencyDisplay, type CurrencyInputOptions } from 'vue-currency-input';
import JInputNumber from './JInputNumber.vue';

defineOptions({ name: 'JInputCurrency' });

const props = withDefaults(
  defineProps<{
    currency?: string;
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' | 'hidden';
    locale?: string;
    hideCurrencySymbolOnFocus?: boolean;
    options?: CurrencyInputOptions;
  }>(),
  {
    currency: 'USD',
    currencyDisplay: 'symbol',
    locale: undefined,
    hideCurrencySymbolOnFocus: true,
    options: undefined,
  },
);

const mergedOptions = computed<CurrencyInputOptions>(() => ({
  currency: props.currency,
  currencyDisplay: props.currencyDisplay as CurrencyDisplay,
  hideCurrencySymbolOnFocus: props.hideCurrencySymbolOnFocus,
  ...(props.locale ? { locale: props.locale } : {}),
  useGrouping: true,
  ...props.options,
}));
</script>

<template>
  <JInputNumber :options="mergedOptions" />
</template>
