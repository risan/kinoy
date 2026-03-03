import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import * as yup from 'yup';
import { CurrencyDisplay } from 'vue-currency-input';
import KInputNumber from '../KInputNumber.vue';
import {
  flushValidation,
  flushCurrencyInput,
  typeIntoCurrencyInput,
  mountWithForm,
} from './helpers';

describe('KInputNumber', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── v-model ──────────────────────────────────────────────

  describe('v-model', () => {
    it('displays formatted value when modelValue is set', async () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: 1234.5 },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('1,234.50');
    });

    it('emits update:modelValue with number value on user input', async () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      await flushCurrencyInput();
      await typeIntoCurrencyInput(wrapper.find('input'), '42');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted!.at(-1)).toEqual([42]);
    });

    it('emits null when input is cleared', async () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: 100 },
      });
      await flushCurrencyInput();
      await typeIntoCurrencyInput(wrapper.find('input'), '');

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted!.at(-1)).toEqual([null]);
    });

    it('updates display when modelValue prop changes externally', async () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: 100 },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('100');

      await wrapper.setProps({ modelValue: 2500 });
      await nextTick();
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('2,500');
    });
  });

  // ── number formatting ──────────────────────────────────────

  describe('number formatting', () => {
    it('hides currency symbol by default', async () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: 1000 },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).not.toContain('$');
    });

    it('sets inputmode to decimal for mobile numeric keyboard', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('inputmode')).toBe('decimal');
    });
  });

  // ── custom options ─────────────────────────────────────────

  describe('custom options', () => {
    it('respects precision option', async () => {
      const wrapper = mount(KInputNumber, {
        props: {
          modelValue: 42.99,
          options: { currency: 'USD', currencyDisplay: CurrencyDisplay.hidden, precision: 0 },
        },
      });
      await flushCurrencyInput();
      // precision: 0 strips decimals (default USD would show '42.99')
      expect(wrapper.find('input').element.value).toBe('43');
    });

    it('respects valueRange (min/max) — clamps on blur', async () => {
      const wrapper = mount(KInputNumber, {
        props: {
          modelValue: null,
          options: {
            currency: 'USD',
            currencyDisplay: CurrencyDisplay.hidden,
            valueRange: { min: 0, max: 100 },
          },
        },
      });
      await flushCurrencyInput();
      await typeIntoCurrencyInput(wrapper.find('input'), '200');
      await wrapper.find('input').trigger('blur');
      await flushCurrencyInput();
      await nextTick();

      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      const lastValue = emitted!.at(-1)![0];
      expect(lastValue).toBe(100);
    });
  });

  // ── options reactivity ─────────────────────────────────────

  describe('options reactivity', () => {
    it('reconfigures formatting when options prop changes', async () => {
      const wrapper = mount(KInputNumber, {
        props: {
          modelValue: 1000,
          options: { currency: 'USD', currencyDisplay: CurrencyDisplay.hidden, useGrouping: true },
        },
      });
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('1,000');

      await wrapper.setProps({
        options: { currency: 'USD', currencyDisplay: CurrencyDisplay.hidden, useGrouping: false },
      });
      await nextTick();
      await flushCurrencyInput();
      expect(wrapper.find('input').element.value).toBe('1000');
    });
  });

  // ── vee-validate integration ─────────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      amount: yup.number().nullable().required('Amount is required').min(1, 'Must be at least 1'),
    });

    it('displays validation error after field is touched and invalid', async () => {
      const wrapper = mountWithForm(KInputNumber, schema, 'amount', {}, null);
      await flushCurrencyInput();
      const input = wrapper.find('input');

      // Type a valid value first so handleChange fires (null → 5)
      await typeIntoCurrencyInput(input, '5');
      // Then clear to trigger required validation (5 → null)
      await typeIntoCurrencyInput(input, '');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Amount is required');
    });

    it('clears validation error when field becomes valid', async () => {
      const wrapper = mountWithForm(KInputNumber, schema, 'amount', {}, null);
      await flushCurrencyInput();
      const input = wrapper.find('input');

      await typeIntoCurrencyInput(input, '5');
      await typeIntoCurrencyInput(input, '');
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Amount is required');

      await typeIntoCurrencyInput(input, '5');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Amount is required');
    });

    it('emits update:modelValue in vee-validate mode', async () => {
      const wrapper = mountWithForm(KInputNumber, schema, 'amount', {}, null);
      await flushCurrencyInput();

      await typeIntoCurrencyInput(wrapper.find('input'), '42');

      const baseInputNumber = wrapper.findComponent(KInputNumber);
      const emitted = baseInputNumber.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      expect(emitted!.at(-1)).toEqual([42]);
    });
  });

  // ── error states ───────────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('applies aria-invalid when error prop is set', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, error: 'Error' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('does not show error styling when no error', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('manual error takes priority over vee-validate error', async () => {
      const schema = yup.object({
        amount: yup.number().nullable().required('Field required'),
      });
      const wrapper = mountWithForm(
        KInputNumber,
        schema,
        'amount',
        {
          error: 'Manual error',
        },
        null,
      );
      await flushCurrencyInput();
      const input = wrapper.find('input');

      // Type then clear so handleChange fires and vee-validate actually
      // produces a 'Field required' error (null→5→null dirties the field)
      await typeIntoCurrencyInput(input, '5');
      await typeIntoCurrencyInput(input, '');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  // ── disabled state ─────────────────────────────────────────

  describe('disabled state', () => {
    it('sets disabled and aria-disabled on input', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, disabled: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.attributes('aria-disabled')).toBe('true');
    });

    it('does not set disabled attributes when not disabled', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeUndefined();
      expect(input.attributes('aria-disabled')).toBeUndefined();
    });
  });

  // ── label ──────────────────────────────────────────────────

  describe('label', () => {
    it('renders when provided', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, label: 'Amount' },
      });
      expect(wrapper.find('label').text()).toBe('Amount');
    });

    it('does not render when omitted', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('associates label with input via for/id', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, label: 'Amount' },
      });
      const label = wrapper.find('label');
      const input = wrapper.find('input');
      expect(label.attributes('for')).toBe(input.attributes('id'));
      expect(label.attributes('for')).toBeTruthy();
    });
  });

  // ── accessibility ──────────────────────────────────────────

  describe('accessibility', () => {
    it('aria-describedby points to error element', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, error: 'Required' },
      });
      const input = wrapper.find('input');
      const errorEl = wrapper.find('[role="alert"]');
      expect(input.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('no aria-describedby without error', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined();
    });

    it('uses custom id prop', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, id: 'custom-id' },
      });
      expect(wrapper.find('input').attributes('id')).toBe('custom-id');
    });

    it('generates unique IDs', () => {
      const Wrapper = defineComponent({
        components: { KInputNumber },
        template: `<div>
          <KInputNumber :model-value="null" />
          <KInputNumber :model-value="null" />
        </div>`,
      });
      const wrapper = mount(Wrapper);
      const inputs = wrapper.findAll('input');
      const id1 = inputs[0].attributes('id');
      const id2 = inputs[1].attributes('id');
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('error has role="alert"', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });
  });

  // ── hint ──────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, hint: 'Enter a whole number' },
      });
      expect(wrapper.text()).toContain('Enter a whole number');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('[id$="-hint"]').exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, hint: 'Some hint' },
      });
      const input = wrapper.find('input');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(input.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, hint: 'Some hint', error: 'Some error' },
      });
      const input = wrapper.find('input');
      const describedby = input.attributes('aria-describedby')!;
      const hintEl = wrapper.find('[id$="-hint"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(describedby).toContain(hintEl.attributes('id'));
      expect(describedby).toContain(errorEl.attributes('id'));
    });

    it('hint remains visible when error is shown', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, hint: 'Helpful hint', error: 'Error message' },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  // ── required ────────────────────────────────────────────

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, label: 'Amount', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, label: 'Amount' },
      });
      expect(wrapper.find('label').text()).not.toContain('*');
    });

    it('shows inline asterisk after input when required is true and no label', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets native required attribute on input', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null, required: true },
      });
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });

    it('does not set required when not required', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('required')).toBeUndefined();
    });
  });

  // ── attribute passthrough ──────────────────────────────────

  describe('attribute passthrough', () => {
    it('HTML attrs pass to input element', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
        attrs: { placeholder: 'Enter amount', 'data-testid': 'amount' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Enter amount');
      expect(input.attributes('data-testid')).toBe('amount');
    });

    it('attrs do not pass to wrapper div', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
        attrs: { placeholder: 'Test' },
      });
      expect(wrapper.attributes('placeholder')).toBeUndefined();
    });

    it('consumer class merges onto input', () => {
      const wrapper = mount(KInputNumber, {
        props: { modelValue: null },
        attrs: { class: 'custom-class' },
      });
      expect(wrapper.find('input').classes()).toContain('custom-class');
    });
  });
});
