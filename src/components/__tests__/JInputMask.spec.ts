import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import * as yup from 'yup';
import JInputMask from '../JInputMask.vue';
import { flushValidation, flushIMask, typeIntoMask, mountWithForm } from './helpers';

describe('JInputMask', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  // ── v-model ──────────────────────────────────────────────

  describe('v-model', () => {
    it('displays masked value when modelValue is set', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '1234567890', mask: { mask: '000-000-0000' } },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('123-456-7890');
    });

    it('emits masked value by default on user input', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      await flushIMask();
      await typeIntoMask(wrapper.find('input'), '1234567890');

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['123-456-7890']);
    });

    it('updates display when modelValue changes externally', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      await flushIMask();
      await wrapper.setProps({ modelValue: '9876543210' });
      await nextTick();
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('987-654-3210');
    });
  });

  // ── unmask prop ─────────────────────────────────────────

  describe('unmask prop', () => {
    it('unmask true: accepts unmasked modelValue and emits unmasked', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '1234567890', mask: { mask: '000-000-0000' }, unmask: true },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('123-456-7890');

      await typeIntoMask(wrapper.find('input'), '0987654321');
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['0987654321']);
    });

    it('unmask false: accepts masked modelValue and emits masked', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '123-456-7890', mask: { mask: '000-000-0000' }, unmask: false },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('123-456-7890');

      await typeIntoMask(wrapper.find('input'), '0987654321');
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['098-765-4321']);
    });
  });

  // ── vee-validate integration ─────────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      phone: yup
        .string()
        .required('Phone is required')
        .matches(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone format'),
    });

    it('displays validation error after field is touched and invalid', async () => {
      const wrapper = mountWithForm(JInputMask, schema, 'phone', {
        mask: { mask: '000-000-0000' },
      });
      const input = wrapper.find('input');

      await typeIntoMask(input, '123');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Invalid phone format');
    });

    it('clears validation error when field becomes valid', async () => {
      const wrapper = mountWithForm(JInputMask, schema, 'phone', {
        mask: { mask: '000-000-0000' },
      });
      const input = wrapper.find('input');

      await typeIntoMask(input, '123');
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Invalid phone format');

      await typeIntoMask(input, '1234567890');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Invalid phone format');
    });

    it('emits update:modelValue in vee-validate mode', async () => {
      const wrapper = mountWithForm(JInputMask, schema, 'phone', {
        mask: { mask: '000-000-0000' },
      });

      await typeIntoMask(wrapper.find('input'), '1234567890');

      const baseInputMask = wrapper.findComponent(JInputMask);
      expect(baseInputMask.emitted('update:modelValue')?.at(-1)).toEqual(['123-456-7890']);
    });
  });

  // ── error states ─────────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('applies aria-invalid when error prop is set', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, error: 'Error' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('does not show error styling when no error', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('manual error takes priority over vee-validate error', async () => {
      const schema = yup.object({
        phone: yup.string().required('Field required'),
      });
      const wrapper = mountWithForm(JInputMask, schema, 'phone', {
        error: 'Manual error',
        mask: { mask: '000-000-0000' },
      });
      const input = wrapper.find('input');

      await typeIntoMask(input, '');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  // ── disabled state ───────────────────────────────────────

  describe('disabled state', () => {
    it('sets disabled attribute and aria-disabled on input', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, disabled: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.attributes('aria-disabled')).toBe('true');
    });

    it('does not set disabled attributes when not disabled', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeUndefined();
      expect(input.attributes('aria-disabled')).toBeUndefined();
    });
  });

  // ── label ────────────────────────────────────────────────

  describe('label', () => {
    it('renders label when provided', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, label: 'Phone' },
      });
      expect(wrapper.find('label').text()).toBe('Phone');
    });

    it('does not render label when omitted', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('associates label with input via for/id', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, label: 'Phone' },
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
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, error: 'Required' },
      });
      const input = wrapper.find('input');
      const errorEl = wrapper.find('[role="alert"]');
      expect(input.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('does not set aria-describedby when no error', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined();
    });

    it('uses provided id prop for input id', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, id: 'custom-id' },
      });
      expect(wrapper.find('input').attributes('id')).toBe('custom-id');
    });

    it('generates a unique id when id prop is not provided', () => {
      const Wrapper = defineComponent({
        components: { JInputMask },
        template: `<div>
          <JInputMask model-value="" :mask="{ mask: '000-000-0000' }" />
          <JInputMask model-value="" :mask="{ mask: '000-000-0000' }" />
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

    it('error message has role="alert"', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });
  });

  // ── hint ─────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, hint: 'Format: XXX-XXX-XXXX' },
      });
      expect(wrapper.text()).toContain('Format: XXX-XXX-XXXX');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      expect(wrapper.find('[id$="-hint"]').exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, hint: 'Some hint' },
      });
      const input = wrapper.find('input');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(input.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(JInputMask, {
        props: {
          modelValue: '',
          mask: { mask: '000-000-0000' },
          hint: 'Some hint',
          error: 'Some error',
        },
      });
      const input = wrapper.find('input');
      const describedby = input.attributes('aria-describedby')!;
      const hintEl = wrapper.find('[id$="-hint"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(describedby).toContain(hintEl.attributes('id'));
      expect(describedby).toContain(errorEl.attributes('id'));
    });

    it('hint remains visible when error is shown', () => {
      const wrapper = mount(JInputMask, {
        props: {
          modelValue: '',
          mask: { mask: '000-000-0000' },
          hint: 'Helpful hint',
          error: 'Error message',
        },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  // ── required ────────────────────────────────────────────

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, label: 'Phone', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, label: 'Phone' },
      });
      expect(wrapper.find('label').text()).not.toContain('*');
    });

    it('shows inline asterisk after input when required is true and no label', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets native required attribute on input', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' }, required: true },
      });
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });

    it('does not set required when not required', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
      });
      expect(wrapper.find('input').attributes('required')).toBeUndefined();
    });
  });

  // ── attribute passthrough ────────────────────────────────

  describe('attribute passthrough', () => {
    it('passes HTML attributes to the underlying input element', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
        attrs: { placeholder: 'Enter phone', maxlength: '100', readonly: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Enter phone');
      expect(input.attributes('maxlength')).toBe('100');
      expect(input.attributes('readonly')).toBeDefined();
    });

    it('does not pass attrs to the wrapper element', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
        attrs: { placeholder: 'Test' },
      });
      expect(wrapper.attributes('placeholder')).toBeUndefined();
    });

    it('merges consumer class onto the input element', () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '', mask: { mask: '000-000-0000' } },
        attrs: { class: 'custom-class' },
      });
      expect(wrapper.find('input').classes()).toContain('custom-class');
    });
  });

  // ── lifecycle ─────────────────────────────────────────────

  describe('lifecycle', () => {
    it('destroys mask instance on unmount without errors', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '1234567890', mask: { mask: '000-000-0000' } },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('123-456-7890');

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  // ── mask prop updates ─────────────────────────────────────

  describe('mask prop updates', () => {
    it('updates mask format when mask prop changes', async () => {
      const wrapper = mount(JInputMask, {
        props: { modelValue: '12345', mask: { mask: '00000' } },
      });
      await flushIMask();
      expect(wrapper.find('input').element.value).toBe('12345');

      await wrapper.setProps({ mask: { mask: '000-000-0000' } });
      await flushIMask();

      await typeIntoMask(wrapper.find('input'), '1234567890');
      expect(wrapper.find('input').element.value).toBe('123-456-7890');
    });
  });
});
