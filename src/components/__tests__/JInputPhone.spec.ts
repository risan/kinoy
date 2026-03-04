import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import * as yup from 'yup';
import JInputPhone from '../JInputPhone.vue';
import { flushValidation, flushIMask, typeIntoMask, mountWithForm } from './helpers';

describe('JInputPhone', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  // ── mask formatting ──────────────────────────────────────

  describe('mask formatting', () => {
    it('formats 10 digits as XXX-XXX-XXXX', async () => {
      const wrapper = mount(JInputPhone, {
        props: { modelValue: '1234567890' },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('123-456-7890');
    });

    it('updates v-model with masked phone string', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(JInputPhone, {
        props: { modelValue: '', 'onUpdate:modelValue': onUpdate },
      });
      await flushIMask();
      await typeIntoMask(wrapper.find('input'), '1234567890');

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate).toHaveBeenLastCalledWith('123-456-7890');
    });
  });

  // ── props/attrs passthrough ──────────────────────────────

  describe('props/attrs passthrough', () => {
    it('passes label, disabled, error, id through', () => {
      const wrapper = mount(JInputPhone, {
        props: {
          modelValue: '',
          label: 'Phone Number',
          disabled: true,
          error: 'Invalid phone',
          id: 'phone-field',
        },
      });
      expect(wrapper.find('label').text()).toBe('Phone Number');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
      expect(wrapper.find('input').attributes('id')).toBe('phone-field');
      expect(wrapper.text()).toContain('Invalid phone');
    });

    it('passes placeholder and other HTML attrs through', () => {
      const wrapper = mount(JInputPhone, {
        props: { modelValue: '' },
        attrs: { placeholder: '000-000-0000', 'data-testid': 'phone' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('000-000-0000');
      expect(input.attributes('data-testid')).toBe('phone');
    });
  });

  // ── hint and required passthrough ───────────────────────

  describe('hint and required passthrough', () => {
    it('passes hint through and renders hint text', () => {
      const wrapper = mount(JInputPhone, {
        props: { modelValue: '', hint: 'Enter US phone number' },
      });
      expect(wrapper.text()).toContain('Enter US phone number');
    });

    it('passes required through and shows asterisk', () => {
      const wrapper = mount(JInputPhone, {
        props: { modelValue: '', label: 'Phone', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
    });
  });

  // ── vee-validate ─────────────────────────────────────────

  describe('vee-validate', () => {
    it('works with useForm and yup validation', async () => {
      const schema = yup.object({
        phone: yup
          .string()
          .required('Phone is required')
          .matches(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone'),
      });
      const wrapper = mountWithForm(JInputPhone, schema, 'phone');
      const input = wrapper.find('input');

      // Type partial value and blur to trigger validation
      await typeIntoMask(input, '123');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Invalid phone');

      // Fix value
      await typeIntoMask(input, '1234567890');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Invalid phone');
    });
  });
});
