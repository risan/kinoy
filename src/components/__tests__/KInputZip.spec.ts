import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import * as yup from 'yup';
import KInputZip from '../KInputZip.vue';
import { flushValidation, flushIMask, typeIntoMask, mountWithForm } from './helpers';

describe('KInputZip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  // ── mask formatting ──────────────────────────────────────

  describe('mask formatting', () => {
    it('accepts 5-digit zip', async () => {
      const wrapper = mount(KInputZip, {
        props: { modelValue: '12345' },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('12345');
    });

    it('accepts 9-digit zip+4 formatted as XXXXX-XXXX', async () => {
      const wrapper = mount(KInputZip, {
        props: { modelValue: '123456789' },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('12345-6789');
    });

    it('updates v-model with masked digits', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(KInputZip, {
        props: { modelValue: '', 'onUpdate:modelValue': onUpdate },
      });
      await flushIMask();
      await typeIntoMask(wrapper.find('input'), '123456789');

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate).toHaveBeenLastCalledWith('12345-6789');
    });
  });

  // ── props/attrs passthrough ──────────────────────────────

  describe('props/attrs passthrough', () => {
    it('passes label, disabled, error, id through', () => {
      const wrapper = mount(KInputZip, {
        props: {
          modelValue: '',
          label: 'Zip Code',
          disabled: true,
          error: 'Invalid zip',
          id: 'zip-field',
        },
      });
      expect(wrapper.find('label').text()).toBe('Zip Code');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
      expect(wrapper.find('input').attributes('id')).toBe('zip-field');
      expect(wrapper.text()).toContain('Invalid zip');
    });

    it('passes placeholder and other HTML attrs through', () => {
      const wrapper = mount(KInputZip, {
        props: { modelValue: '' },
        attrs: { placeholder: '00000', 'data-testid': 'zip' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('00000');
      expect(input.attributes('data-testid')).toBe('zip');
    });
  });

  // ── hint and required passthrough ───────────────────────

  describe('hint and required passthrough', () => {
    it('passes hint through and renders hint text', () => {
      const wrapper = mount(KInputZip, {
        props: { modelValue: '', hint: 'Enter 5 or 9 digit zip' },
      });
      expect(wrapper.text()).toContain('Enter 5 or 9 digit zip');
    });

    it('passes required through and shows asterisk', () => {
      const wrapper = mount(KInputZip, {
        props: { modelValue: '', label: 'Zip Code', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
    });
  });

  // ── vee-validate ─────────────────────────────────────────

  describe('vee-validate', () => {
    it('works with useForm and yup validation', async () => {
      const schema = yup.object({
        zip: yup
          .string()
          .required('Zip is required')
          .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip'),
      });
      const wrapper = mountWithForm(KInputZip, schema, 'zip');
      const input = wrapper.find('input');

      // Type partial value and blur
      await typeIntoMask(input, '12');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Invalid zip');

      // Fix value
      await typeIntoMask(input, '12345');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Invalid zip');
    });
  });
});
