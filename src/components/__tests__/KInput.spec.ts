import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import * as yup from 'yup';
import KInput from '../KInput.vue';
import { flushValidation, mountWithForm } from './helpers';

describe('KInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  // ── v-model ──────────────────────────────────────────────

  describe('v-model', () => {
    it('displays the modelValue as input value', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: 'hello' },
      });
      expect(wrapper.find('input').element.value).toBe('hello');
    });

    it('emits update:modelValue on user input', async () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      await wrapper.find('input').setValue('new value');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value']);
    });

    it('updates displayed value when modelValue prop changes', async () => {
      const wrapper = mount(KInput, {
        props: { modelValue: 'initial' },
      });
      await wrapper.setProps({ modelValue: 'updated' });
      expect(wrapper.find('input').element.value).toBe('updated');
    });
  });

  // ── vee-validate integration ─────────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      email: yup.string().required('Email is required').email('Invalid email'),
    });

    it('displays validation error after field is touched and invalid', async () => {
      const wrapper = mountWithForm(KInput, schema, 'email');
      const input = wrapper.find('input');

      await input.setValue('');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Email is required');
    });

    it('clears validation error when field becomes valid', async () => {
      const wrapper = mountWithForm(KInput, schema, 'email');
      const input = wrapper.find('input');

      // Trigger error
      await input.setValue('');
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Email is required');

      // Fix the value
      await input.setValue('user@example.com');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Email is required');
    });

    it('emits update:modelValue even in vee-validate mode', async () => {
      const wrapper = mountWithForm(KInput, schema, 'email');
      const input = wrapper.find('input');

      await input.setValue('test@example.com');
      // The event is emitted on the KInput component (child of wrapper)
      const baseInput = wrapper.findComponent(KInput);
      expect(baseInput.emitted('update:modelValue')?.[0]).toEqual(['test@example.com']);
    });
  });

  // ── error states ─────────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('applies error styling when error prop is set', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', error: 'Error' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('does not show error styling when no error', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('manual error takes priority over vee-validate error', async () => {
      const schema = yup.object({
        name: yup.string().required('Field required'),
      });
      const wrapper = mountWithForm(KInput, schema, 'name', {
        error: 'Manual error',
      });
      const input = wrapper.find('input');

      // Trigger vee-validate error
      await input.setValue('');
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
      const wrapper = mount(KInput, {
        props: { modelValue: '', disabled: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
      expect(input.attributes('aria-disabled')).toBe('true');
    });

    it('does not set disabled attributes when not disabled', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeUndefined();
      expect(input.attributes('aria-disabled')).toBeUndefined();
    });
  });

  // ── label ────────────────────────────────────────────────

  describe('label', () => {
    it('renders label when provided', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', label: 'Email' },
      });
      expect(wrapper.find('label').text()).toBe('Email');
    });

    it('does not render label when omitted', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('associates label with input via for/id', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', label: 'Email' },
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
      const wrapper = mount(KInput, {
        props: { modelValue: '', error: 'Required' },
      });
      const input = wrapper.find('input');
      const errorEl = wrapper.find('[role="alert"]');
      expect(input.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('does not set aria-describedby when no error', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined();
    });

    it('uses provided id prop for input id', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', id: 'custom-id' },
      });
      expect(wrapper.find('input').attributes('id')).toBe('custom-id');
    });

    it('generates a unique id when id prop is not provided', () => {
      const Wrapper = defineComponent({
        components: { KInput },
        template: '<div><KInput model-value="" /><KInput model-value="" /></div>',
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
      const wrapper = mount(KInput, {
        props: { modelValue: '', error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });
  });

  // ── hint ─────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', hint: 'Format: MM/DD/YYYY' },
      });
      expect(wrapper.text()).toContain('Format: MM/DD/YYYY');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(hintEl.exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', hint: 'Some hint' },
      });
      const input = wrapper.find('input');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(input.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', hint: 'Some hint', error: 'Some error' },
      });
      const input = wrapper.find('input');
      const describedby = input.attributes('aria-describedby')!;
      const hintEl = wrapper.find('[id$="-hint"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(describedby).toContain(hintEl.attributes('id'));
      expect(describedby).toContain(errorEl.attributes('id'));
    });

    it('hint remains visible when error is shown', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', hint: 'Helpful hint', error: 'Error message' },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  // ── required ────────────────────────────────────────────

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', label: 'Email', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', label: 'Email' },
      });
      const label = wrapper.find('label');
      expect(label.text()).not.toContain('*');
    });

    it('shows inline asterisk after input when required is true and no label', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets native required attribute on input', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '', required: true },
      });
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });

    it('does not set required when not required', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
      });
      expect(wrapper.find('input').attributes('required')).toBeUndefined();
    });
  });

  // ── attribute passthrough ────────────────────────────────

  describe('attribute passthrough', () => {
    it('passes HTML attributes to the underlying input element', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
        attrs: { placeholder: 'Enter text', maxlength: '100', readonly: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Enter text');
      expect(input.attributes('maxlength')).toBe('100');
      expect(input.attributes('readonly')).toBeDefined();
    });

    it('does not pass attrs to the wrapper element', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
        attrs: { placeholder: 'Test' },
      });
      // Wrapper div should not have placeholder
      expect(wrapper.attributes('placeholder')).toBeUndefined();
    });

    it('merges consumer class onto the input element', () => {
      const wrapper = mount(KInput, {
        props: { modelValue: '' },
        attrs: { class: 'custom-class' },
      });
      expect(wrapper.find('input').classes()).toContain('custom-class');
    });
  });
});
