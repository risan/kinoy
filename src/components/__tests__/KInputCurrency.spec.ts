import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import * as yup from 'yup';
import { CurrencyDisplay } from 'vue-currency-input';
import KInputCurrency from '../KInputCurrency.vue';
import {
  flushValidation,
  flushCurrencyInput,
  typeIntoCurrencyInput,
  mountWithForm,
} from './helpers';

describe('KInputCurrency', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── currency formatting ────────────────────────────────────

  describe('currency formatting', () => {
    it('displays value with currency symbol', async () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: 1234.5 },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('$1,234.50');
    });

    it('updates v-model with number value (not formatted string)', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: null, 'onUpdate:modelValue': onUpdate },
      });
      await flushCurrencyInput();
      await typeIntoCurrencyInput(wrapper.find('input'), '99.99');

      expect(onUpdate).toHaveBeenCalled();
      const value = onUpdate.mock.calls.at(-1)![0];
      expect(typeof value).toBe('number');
      expect(value).toBe(99.99);
    });

    it('formats with custom currency prop', async () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: 1000, currency: 'EUR', locale: 'de-DE' },
      });
      await flushCurrencyInput();
      const value = wrapper.find('input').element.value;
      // EUR with de-DE locale uses € symbol and . as grouping
      expect(value).toContain('€');
    });
  });

  // ── props/attrs passthrough ────────────────────────────────

  describe('props/attrs passthrough', () => {
    it('passes label, disabled, error, id through', async () => {
      const wrapper = mount(KInputCurrency, {
        props: {
          modelValue: null,
          label: 'Total Cost',
          disabled: true,
          error: 'Invalid amount',
          id: 'cost-field',
        },
      });
      expect(wrapper.find('label').text()).toBe('Total Cost');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
      expect(wrapper.find('input').attributes('id')).toBe('cost-field');
      expect(wrapper.text()).toContain('Invalid amount');
    });

    it('passes placeholder and other HTML attrs through', () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: null },
        attrs: { placeholder: '$0.00', 'data-testid': 'currency' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('$0.00');
      expect(input.attributes('data-testid')).toBe('currency');
    });
  });

  // ── convenience props ──────────────────────────────────────

  describe('convenience props', () => {
    it('applies currencyDisplay prop', async () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: 500, currencyDisplay: 'code' },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toContain('USD');
    });

    it('options prop overrides convenience props', async () => {
      const wrapper = mount(KInputCurrency, {
        props: {
          modelValue: 500,
          currency: 'EUR',
          options: { currency: 'GBP', currencyDisplay: CurrencyDisplay.symbol },
        },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toContain('£');
    });
  });

  // ── hint and required passthrough ───────────────────────

  describe('hint and required passthrough', () => {
    it('passes hint through and renders hint text', () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: null, hint: 'Enter amount in USD' },
      });
      expect(wrapper.text()).toContain('Enter amount in USD');
    });

    it('passes required through and shows asterisk', () => {
      const wrapper = mount(KInputCurrency, {
        props: { modelValue: null, label: 'Total Cost', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
    });
  });

  // ── vee-validate ───────────────────────────────────────────

  describe('vee-validate', () => {
    it('works with useForm and yup number validation', async () => {
      const schema = yup.object({
        price: yup.number().nullable().required('Price is required').min(0.01, 'Must be positive'),
      });
      const wrapper = mountWithForm(KInputCurrency, schema, 'price', {}, null);
      await flushCurrencyInput();
      const input = wrapper.find('input');

      // Type then clear to trigger required validation
      await typeIntoCurrencyInput(input, '5');
      await typeIntoCurrencyInput(input, '');
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Price is required');

      // Fix the value
      await typeIntoCurrencyInput(input, '10');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Price is required');
    });
  });
});
