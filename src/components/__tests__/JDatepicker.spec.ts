import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import * as yup from 'yup';
import JDatepicker from '../JDatepicker.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { flushValidation, mountWithForm } from './helpers';

describe('JDatepicker', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── v-model ──────────────────────────────────────────────

  describe('v-model', () => {
    it('emits update:modelValue when VueDatePicker emits update:model-value', async () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      const dp = wrapper.findComponent(VueDatePicker);
      const testDate = new Date(2025, 0, 15);
      dp.vm.$emit('update:model-value', testDate);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([testDate]);
    });

    it('updates VueDatePicker model-value when modelValue prop changes', async () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      const testDate = new Date(2025, 5, 1);
      await wrapper.setProps({ modelValue: testDate });

      const dp = wrapper.findComponent(VueDatePicker);
      expect(dp.props('modelValue')).toEqual(testDate);
    });
  });

  // ── vee-validate integration ─────────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      date: yup.date().required('Date is required').typeError('Date is required'),
    });

    it('displays validation error after field is touched and invalid', async () => {
      const wrapper = mountWithForm(JDatepicker, schema, 'date', {}, null);
      const input = wrapper.find('input');

      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Date is required');
    });

    it('clears validation error when field becomes valid', async () => {
      const wrapper = mountWithForm(JDatepicker, schema, 'date', {}, null);
      const input = wrapper.find('input');

      // Trigger error
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Date is required');

      // Fix the value via VueDatePicker emit
      const dp = wrapper.findComponent(VueDatePicker);
      dp.vm.$emit('update:model-value', new Date(2025, 5, 1));
      await flushValidation();
      expect(wrapper.text()).not.toContain('Date is required');
    });

    it('emits update:modelValue even in vee-validate mode', async () => {
      const wrapper = mountWithForm(JDatepicker, schema, 'date', {}, null);
      const dp = wrapper.findComponent(VueDatePicker);
      const testDate = new Date(2025, 5, 1);

      dp.vm.$emit('update:model-value', testDate);
      await wrapper.vm.$nextTick();

      const baseDatepicker = wrapper.findComponent(JDatepicker);
      expect(baseDatepicker.emitted('update:modelValue')?.[0]).toEqual([testDate]);
    });
  });

  // ── error states ─────────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('applies error styling when error prop is set', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, error: 'Error' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('does not show error styling when no error', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('manual error takes priority over vee-validate error', async () => {
      const schema = yup.object({
        date: yup.date().required('Field required').typeError('Field required'),
      });
      const wrapper = mountWithForm(
        JDatepicker,
        schema,
        'date',
        {
          error: 'Manual error',
        },
        null,
      );
      const input = wrapper.find('input');

      // Trigger vee-validate error
      await input.trigger('blur');
      await flushValidation();

      // Manual error should display, not vee-validate error
      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  // ── disabled state ───────────────────────────────────────

  describe('disabled state', () => {
    it('sets disabled attribute and aria-disabled on input', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, disabled: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.attributes('aria-disabled')).toBe('true');
    });

    it('does not set disabled attributes when not disabled', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeUndefined();
      expect(input.attributes('aria-disabled')).toBeUndefined();
    });
  });

  // ── label ────────────────────────────────────────────────

  describe('label', () => {
    it('renders label when provided', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, label: 'Birth Date' },
      });
      expect(wrapper.find('label').text()).toBe('Birth Date');
    });

    it('does not render label when omitted', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('associates label with input via for/id', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, label: 'Birth Date' },
      });
      const label = wrapper.find('label');
      const input = wrapper.find('input');
      expect(label.attributes('for')).toBe(input.attributes('id'));
      expect(label.attributes('for')).toBeTruthy();
    });
  });

  // ── accessibility ────────────────────────────────────────

  describe('accessibility', () => {
    it('sets aria-describedby pointing to error element when in error state', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, error: 'Required' },
      });
      const input = wrapper.find('input');
      const errorEl = wrapper.find('[role="alert"]');
      expect(input.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('does not set aria-describedby when no error', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined();
    });

    it('uses provided id prop for input id', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, id: 'custom-id' },
      });
      expect(wrapper.find('input').attributes('id')).toBe('custom-id');
    });

    it('generates unique id when id prop is not provided', () => {
      const Wrapper = defineComponent({
        components: { JDatepicker },
        template:
          '<div><JDatepicker :model-value="null" /><JDatepicker :model-value="null" /></div>',
      });
      const wrapper = mount(Wrapper);
      const inputs = wrapper.findAll('input');
      const id1 = inputs[0].attributes('id');
      const id2 = inputs[1].attributes('id');
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('error message has role="alert"', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });

    it('input has aria-haspopup="dialog"', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('aria-haspopup')).toBe('dialog');
    });
  });

  // ── hint ─────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, hint: 'Format: MM/DD/YYYY' },
      });
      expect(wrapper.text()).toContain('Format: MM/DD/YYYY');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('[id$="-hint"]').exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, hint: 'Some hint' },
      });
      const input = wrapper.find('input');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(input.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(JDatepicker, {
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
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, hint: 'Helpful hint', error: 'Error message' },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  // ── required ────────────────────────────────────────────

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, label: 'Birth Date', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, label: 'Birth Date' },
      });
      expect(wrapper.find('label').text()).not.toContain('*');
    });

    it('shows inline asterisk after input when required is true and no label', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets native required attribute on input', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, required: true },
      });
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });

    it('does not set required when not required', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      expect(wrapper.find('input').attributes('required')).toBeUndefined();
    });
  });

  // ── attribute passthrough ────────────────────────────────

  describe('attribute passthrough', () => {
    it('passes unknown props through to VueDatePicker', () => {
      const minDate = new Date(2025, 0, 1);
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
        attrs: { 'min-date': minDate },
      });
      const dp = wrapper.findComponent(VueDatePicker);
      expect(dp.props('minDate')).toEqual(minDate);
    });

    it('passes autoApply prop to VueDatePicker (defaults to true)', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
      });
      const dp = wrapper.findComponent(VueDatePicker);
      expect(dp.props('autoApply')).toBe(true);
    });

    it('passes autoApply=false to VueDatePicker when explicitly set', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null, autoApply: false },
      });
      const dp = wrapper.findComponent(VueDatePicker);
      expect(dp.props('autoApply')).toBe(false);
    });

    it('passes placeholder to the input element', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
        attrs: { placeholder: 'Select a date' },
      });
      expect(wrapper.find('input').attributes('placeholder')).toBe('Select a date');
    });

    it('does not pass attrs to the wrapper element', () => {
      const wrapper = mount(JDatepicker, {
        props: { modelValue: null },
        attrs: { placeholder: 'Select a date' },
      });
      expect(wrapper.attributes('placeholder')).toBeUndefined();
    });
  });
});
