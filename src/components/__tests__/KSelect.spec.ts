import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import * as yup from 'yup';
import KSelect from '../KSelect.vue';
import KLoading from '../KLoading.vue';
import { flushValidation, mountWithForm, openSelect, getOptions, getGroupHeaders } from './helpers';

describe('KSelect', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe('option rendering & dropdown', () => {
    it('renders primitive string options in dropdown', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['Apple', 'Banana'] },
      });
      await openSelect(wrapper);
      const options = getOptions(wrapper);
      expect(options).toHaveLength(2);
      expect(options[0].text()).toBe('Apple');
      expect(options[1].text()).toBe('Banana');
    });

    it('renders object options using optionValue/optionLabel', async () => {
      const wrapper = mount(KSelect, {
        props: {
          options: [{ id: 1, name: 'Apple' }],
          optionValue: 'id',
          optionLabel: 'name',
        },
      });
      await openSelect(wrapper);
      const options = getOptions(wrapper);
      expect(options[0].text()).toBe('Apple');
    });

    it('supports function accessors', async () => {
      const wrapper = mount(KSelect, {
        props: {
          options: [{ code: 'a', label: 'Alpha' }],
          optionValue: ((o: Record<string, unknown>) => o.code) as unknown as string,
          optionLabel: ((o: Record<string, unknown>) => o.label) as unknown as string,
        },
      });
      await openSelect(wrapper);
      expect(getOptions(wrapper)[0].text()).toBe('Alpha');
    });

    it('opens dropdown on trigger click', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
      });
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
      await openSelect(wrapper);
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    });

    it('closes on second click', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
      });
      await openSelect(wrapper);
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
      await wrapper.find('[role="combobox"]').trigger('click');
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    });

    it('closes on Escape', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
      });
      await openSelect(wrapper);
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    });
  });

  describe('single select', () => {
    it('selects option and emits update:modelValue', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B', 'C'] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[1].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['B']);
    });

    it('displays selected option text in trigger', () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'B', options: ['A', 'B', 'C'] },
      });
      expect(wrapper.find('[role="combobox"]').text()).toContain('B');
    });

    it('closes dropdown after selecting', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    });

    it('deselects when canDeselect and same option clicked', async () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A', 'B'], canDeselect: true },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('does not deselect when canDeselect is false', async () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['A']);
    });

    it('shows placeholder when nothing selected', () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'], placeholder: 'Choose...' },
      });
      expect(wrapper.find('.text-input-placeholder').text()).toBe('Choose...');
    });
  });

  describe('multiple select', () => {
    it('selects multiple and emits array', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', options: ['A', 'B', 'C'], modelValue: [] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A']]);
    });

    it('toggles off already-selected option', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A', 'B'], options: ['A', 'B', 'C'] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['B']]);
    });

    it('keeps dropdown open after selecting', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', options: ['A', 'B'], modelValue: [] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    });

    it('displays tags for selected values', () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A', 'B'], options: ['A', 'B', 'C'] },
      });
      const tags = wrapper.findAll('.bg-select-tag-bg');
      expect(tags).toHaveLength(2);
      expect(tags[0].text()).toContain('A');
      expect(tags[1].text()).toContain('B');
    });

    it('removes tag via remove button', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A', 'B'], options: ['A', 'B'] },
      });
      const removeButtons = wrapper.findAll('[aria-label^="Remove"]');
      await removeButtons[0].trigger('click');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['B']]);
    });

    it('handles null modelValue by defaulting to empty array', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: null as unknown as string[], options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A']]);
    });
  });

  describe('tags mode', () => {
    it('selects from existing options', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', options: ['A', 'B'], modelValue: [] },
      });
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A']]);
    });

    it('creates new tag on Enter when createOption is true', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: [], options: ['A'], createOption: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('NewTag');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['NewTag']]);
    });

    it('creates new tag on Tab', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: [], options: ['A'], createOption: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('TabTag');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Tab' });
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['TabTag']]);
    });

    it('creates new tag on Comma', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: [], options: ['A'], createOption: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('CommaTag');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: ',' });
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['CommaTag']]);
    });

    it('uses createOption function', async () => {
      const wrapper = mount(KSelect, {
        props: {
          mode: 'tags',
          modelValue: [],
          options: [],
          optionValue: 'id',
          optionLabel: 'label',
          createOption: (q: string) => ({ id: q, label: q }),
        },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('custom');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['custom']]);
    });

    it('does not create duplicate tags', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: ['A'], options: ['A'], createOption: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('A');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('does not create tags when createOption is false', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: [], options: ['A'] },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('NewTag');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('clears search after creating tag', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: [], options: [], createOption: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('Tag1');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Enter' });
      expect((input.element as HTMLInputElement).value).toBe('');
    });
  });

  describe('v-model', () => {
    it('reflects modelValue for single mode', () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'B', options: ['A', 'B'] },
      });
      expect(wrapper.find('[role="combobox"]').text()).toContain('B');
    });

    it('reflects modelValue array for multiple mode', () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A', 'B'], options: ['A', 'B', 'C'] },
      });
      const tags = wrapper.findAll('.bg-select-tag-bg');
      expect(tags).toHaveLength(2);
    });

    it('updates display when modelValue changes externally', async () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A', 'B'] },
      });
      expect(wrapper.find('[role="combobox"]').text()).toContain('A');
      await wrapper.setProps({ modelValue: 'B' });
      expect(wrapper.find('[role="combobox"]').text()).toContain('B');
    });
  });

  describe('vee-validate integration', () => {
    const schema = yup.object({
      fruit: yup.string().required('Required').defined(),
    });

    it('displays validation error after blur when invalid', async () => {
      const wrapper = mountWithForm(
        KSelect,
        schema,
        'fruit',
        {
          options: ['Apple', 'Banana'],
        },
        undefined,
      );

      // Select an option to make the field dirty, then clear it
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      // Clear the value
      await wrapper.find('[aria-label="Clear selection"]').trigger('click');
      // Trigger blur for validation
      await wrapper.find('[role="combobox"]').trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Required');
    });

    it('clears validation error when valid', async () => {
      const wrapper = mountWithForm(
        KSelect,
        schema,
        'fruit',
        {
          options: ['Apple', 'Banana'],
        },
        undefined,
      );

      // Select and clear to trigger error
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      await wrapper.find('[aria-label="Clear selection"]').trigger('click');
      await wrapper.find('[role="combobox"]').trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Required');

      // Select a value to clear the error
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Required');
    });

    it('emits update:modelValue in vee-validate mode', async () => {
      const wrapper = mountWithForm(
        KSelect,
        schema,
        'fruit',
        {
          options: ['Apple', 'Banana'],
        },
        '',
      );
      await openSelect(wrapper);
      await getOptions(wrapper)[0].trigger('mousedown');
      const baseSelect = wrapper.findComponent(KSelect);
      expect(baseSelect.emitted('update:modelValue')?.[0]).toEqual(['Apple']);
    });
  });

  describe('search / filtering', () => {
    it('filters primitives locally when local is true', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['Apple', 'Banana', 'Avocado'], local: true },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('av');
      const options = getOptions(wrapper);
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.some((o) => o.text().includes('Avocado'))).toBe(true);
      expect(options.some((o) => o.text().includes('Banana'))).toBe(false);
    });

    it('emits search event when local is false', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('test');
      expect(wrapper.emitted('search')?.[0]).toEqual(['test']);
    });

    it('hides search input when disableSearch is true', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'], disableSearch: true },
      });
      await openSelect(wrapper);
      expect(wrapper.find('input[type="text"]').exists()).toBe(false);
    });

    it('shows emptyText when no options match', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'], local: true, emptyText: 'Nothing here' },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('xyz');
      expect(wrapper.text()).toContain('Nothing here');
    });

    it('clears search when dropdown closes', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('test');
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Escape' });
      await openSelect(wrapper);
      const newInput = wrapper.find('input[type="text"]');
      expect((newInput.element as HTMLInputElement).value).toBe('');
    });

    it('filters object options locally using Fuse.js', async () => {
      const wrapper = mount(KSelect, {
        props: {
          options: [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
            { id: 3, name: 'Apricot' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          local: true,
        },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('app');
      const options = getOptions(wrapper);
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.some((o) => o.text().includes('Apple'))).toBe(true);
      expect(options.some((o) => o.text().includes('Banana'))).toBe(false);
    });

    it('searchableFields restricts which keys Fuse.js searches', async () => {
      const wrapper = mount(KSelect, {
        props: {
          options: [
            { id: 1, name: 'Apple', code: 'BAN' },
            { id: 2, name: 'Banana', code: 'APP' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          local: true,
          searchableFields: ['code'],
        },
      });
      await openSelect(wrapper);
      const input = wrapper.find('input[type="text"]');
      await input.setValue('APP');
      const options = getOptions(wrapper);
      expect(options).toHaveLength(1);
      expect(options[0].text()).toBe('Banana');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown opens dropdown when closed', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    });

    it('ArrowDown moves highlight down', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B', 'C'] },
      });
      await openSelect(wrapper);
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('keydown', { key: 'ArrowDown' });
      expect(getOptions(wrapper)[0].attributes('data-highlighted')).toBeDefined();
      await combobox.trigger('keydown', { key: 'ArrowDown' });
      expect(getOptions(wrapper)[1].attributes('data-highlighted')).toBeDefined();
    });

    it('wraps from last to first on ArrowDown', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('keydown', { key: 'ArrowDown' }); // 0
      await combobox.trigger('keydown', { key: 'ArrowDown' }); // 1
      await combobox.trigger('keydown', { key: 'ArrowDown' }); // wraps to 0
      expect(getOptions(wrapper)[0].attributes('data-highlighted')).toBeDefined();
    });

    it('ArrowUp wraps from first to last', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B', 'C'] },
      });
      await openSelect(wrapper);
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('keydown', { key: 'ArrowDown' }); // 0
      await combobox.trigger('keydown', { key: 'ArrowUp' }); // wraps to 2
      expect(getOptions(wrapper)[2].attributes('data-highlighted')).toBeDefined();
    });

    it('Enter selects highlighted option', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'] },
      });
      await openSelect(wrapper);
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('keydown', { key: 'ArrowDown' }); // highlight 0
      await combobox.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['A']);
    });

    it('Home moves to first, End to last', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B', 'C'] },
      });
      await openSelect(wrapper);
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('keydown', { key: 'End' });
      expect(getOptions(wrapper)[2].attributes('data-highlighted')).toBeDefined();
      await combobox.trigger('keydown', { key: 'Home' });
      expect(getOptions(wrapper)[0].attributes('data-highlighted')).toBeDefined();
    });

    it('Escape closes dropdown', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
      });
      await openSelect(wrapper);
      await wrapper.find('[role="combobox"]').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    });
  });

  describe('clear button', () => {
    it('shows clear button when value selected and hideClear is false', () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A'] },
      });
      expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(true);
    });

    it('hides when hideClear is true', () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A'], hideClear: true },
      });
      expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false);
    });

    it('clears selection', async () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A'] },
      });
      await wrapper.find('[aria-label="Clear selection"]').trigger('click');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('clears multi mode selection to empty array', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A', 'B'], options: ['A', 'B'] },
      });
      await wrapper.find('[aria-label="Clear selection"]').trigger('click');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]]);
    });

    it('not shown when nothing selected', () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
      });
      expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false);
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const wrapper = mount(KSelect, {
        props: { loading: true, options: [] },
      });
      expect(wrapper.findComponent(KLoading).exists()).toBe(true);
    });

    it('hides spinner when not loading', () => {
      const wrapper = mount(KSelect, {
        props: { loading: false, options: [] },
      });
      expect(wrapper.findComponent(KLoading).exists()).toBe(false);
    });
  });

  describe('error states', () => {
    it('displays error from prop', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], error: 'Bad input' },
      });
      expect(wrapper.text()).toContain('Bad input');
    });

    it('aria-invalid when error present', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], error: 'Error' },
      });
      expect(wrapper.find('[role="combobox"]').attributes('aria-invalid')).toBe('true');
    });

    it('manual error priority over vee-validate', async () => {
      const schema = yup.object({
        name: yup.string().required('Field required').defined(),
      });
      const wrapper = mountWithForm(
        KSelect,
        schema,
        'name',
        {
          options: ['A', 'B'],
          error: 'Manual error',
        },
        '',
      );
      const combobox = wrapper.find('[role="combobox"]');
      await combobox.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  describe('disabled state', () => {
    it('aria-disabled on trigger', () => {
      const wrapper = mount(KSelect, {
        props: { disabled: true, options: [] },
      });
      expect(wrapper.find('[role="combobox"]').attributes('aria-disabled')).toBe('true');
    });

    it('does not open when disabled', async () => {
      const wrapper = mount(KSelect, {
        props: { disabled: true, options: ['A'] },
      });
      await wrapper.find('[role="combobox"]').trigger('click');
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    });

    it('prevents tag removal when disabled', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'tags', modelValue: ['A', 'B'], options: ['A', 'B'], disabled: true },
      });
      const removeButtons = wrapper.findAll('[aria-label^="Remove"]');
      await removeButtons[0].trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('disables search input in multi mode', () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: [], options: ['A'], disabled: true },
      });
      const input = wrapper.find('input[type="text"]');
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  describe('label', () => {
    it('renders when provided', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], label: 'Fruit' },
      });
      expect(wrapper.find('label').text()).toBe('Fruit');
    });

    it('not rendered when omitted', () => {
      const wrapper = mount(KSelect, {
        props: { options: [] },
      });
      expect(wrapper.find('label').exists()).toBe(false);
    });

    it('for/id association', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], label: 'Fruit' },
      });
      const label = wrapper.find('label');
      const combobox = wrapper.find('[role="combobox"]');
      expect(label.attributes('for')).toBe(combobox.attributes('id'));
      expect(label.attributes('for')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('trigger has role="combobox"', () => {
      const wrapper = mount(KSelect, { props: { options: [] } });
      expect(wrapper.find('[role="combobox"]').exists()).toBe(true);
    });

    it('aria-expanded matches open state', async () => {
      const wrapper = mount(KSelect, { props: { options: ['A'] } });
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
      await openSelect(wrapper);
      expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    });

    it('aria-controls points to listbox id', () => {
      const wrapper = mount(KSelect, { props: { options: [] } });
      const combobox = wrapper.find('[role="combobox"]');
      const listbox = wrapper.find('[role="listbox"]');
      expect(combobox.attributes('aria-controls')).toBe(listbox.attributes('id'));
    });

    it('aria-activedescendant updates with highlighted option', async () => {
      const wrapper = mount(KSelect, { props: { options: ['A', 'B'] } });
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.attributes('aria-activedescendant')).toBeUndefined();
      await openSelect(wrapper);
      await combobox.trigger('keydown', { key: 'ArrowDown' });
      const optionId = getOptions(wrapper)[0].attributes('id');
      expect(combobox.attributes('aria-activedescendant')).toBe(optionId);
    });

    it('listbox has role="listbox"', () => {
      const wrapper = mount(KSelect, { props: { options: [] } });
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    });

    it('options have role="option" and aria-selected', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A', 'B'], modelValue: 'A' },
      });
      await openSelect(wrapper);
      const options = getOptions(wrapper);
      expect(options[0].attributes('aria-selected')).toBe('true');
      expect(options[1].attributes('aria-selected')).toBe('false');
    });

    it('aria-multiselectable on listbox in multiple mode', () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', options: [], modelValue: [] },
      });
      expect(wrapper.find('[role="listbox"]').attributes('aria-multiselectable')).toBe('true');
    });

    it('error has role="alert"', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], error: 'Error' },
      });
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
      expect(wrapper.find('[role="alert"]').text()).toBe('Error');
    });

    it('aria-describedby points to error', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], error: 'Error' },
      });
      const combobox = wrapper.find('[role="combobox"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(combobox.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('uses provided id prop', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], id: 'custom-id' },
      });
      expect(wrapper.find('[role="combobox"]').attributes('id')).toBe('custom-id');
    });

    it('generates unique ids', () => {
      const Wrapper = defineComponent({
        components: { KSelect },
        template: '<div><KSelect :options="[]" /><KSelect :options="[]" /></div>',
      });
      const wrapper = mount(Wrapper);
      const comboboxes = wrapper.findAll('[role="combobox"]');
      const id1 = comboboxes[0].attributes('id');
      const id2 = comboboxes[1].attributes('id');
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('slots', () => {
    it('#option slot renders custom content', async () => {
      const wrapper = mount(KSelect, {
        props: { options: ['A'] },
        slots: {
          option: (props: Record<string, unknown>) => `Custom: ${props.option}`,
        },
      });
      await openSelect(wrapper);
      expect(getOptions(wrapper)[0].text()).toBe('Custom: A');
    });

    it('#selected-option renders in single mode', () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A'] },
        slots: {
          'selected-option': (props: Record<string, unknown>) => `Sel: ${props.option}`,
        },
      });
      expect(wrapper.find('[role="combobox"]').text()).toContain('Sel: A');
    });

    it('#tag slot in multi mode', () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A'], options: ['A'] },
        slots: {
          tag: (props: Record<string, unknown>) => `Tag: ${props.option}`,
        },
      });
      expect(wrapper.text()).toContain('Tag: A');
    });
  });

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], hint: 'Select one option' },
      });
      expect(wrapper.text()).toContain('Select one option');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(KSelect, {
        props: { options: [] },
      });
      expect(wrapper.find('[id$="-hint"]').exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], hint: 'Some hint' },
      });
      const combobox = wrapper.find('[role="combobox"]');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(combobox.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], hint: 'Some hint', error: 'Some error' },
      });
      const combobox = wrapper.find('[role="combobox"]');
      const describedby = combobox.attributes('aria-describedby')!;
      const hintEl = wrapper.find('[id$="-hint"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(describedby).toContain(hintEl.attributes('id'));
      expect(describedby).toContain(errorEl.attributes('id'));
    });

    it('hint remains visible when error is shown', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], hint: 'Helpful hint', error: 'Error message' },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], label: 'Fruit', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], label: 'Fruit' },
      });
      expect(wrapper.find('label').text()).not.toContain('*');
    });

    it('shows inline asterisk when required is true and no label', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets aria-required on combobox', () => {
      const wrapper = mount(KSelect, {
        props: { options: [], required: true },
      });
      expect(wrapper.find('[role="combobox"]').attributes('aria-required')).toBe('true');
    });

    it('does not set aria-required when not required', () => {
      const wrapper = mount(KSelect, {
        props: { options: [] },
      });
      expect(wrapper.find('[role="combobox"]').attributes('aria-required')).toBeUndefined();
    });
  });

  describe('attribute passthrough', () => {
    it('passes attrs to trigger element', () => {
      const wrapper = mount(KSelect, {
        props: { options: [] },
        attrs: { 'data-testid': 'my-select' },
      });
      expect(wrapper.find('[role="combobox"]').attributes('data-testid')).toBe('my-select');
    });

    it('does not pass attrs to wrapper', () => {
      const wrapper = mount(KSelect, {
        props: { options: [] },
        attrs: { 'data-testid': 'my-select' },
      });
      expect(wrapper.attributes('data-testid')).toBeUndefined();
    });
  });

  describe('exposed methods', () => {
    it('clear() resets single mode to null', async () => {
      const wrapper = mount(KSelect, {
        props: { modelValue: 'A', options: ['A'] },
      });
      (wrapper.vm as unknown as { clear: () => void }).clear();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('clear() resets multi mode to []', async () => {
      const wrapper = mount(KSelect, {
        props: { mode: 'multiple', modelValue: ['A'], options: ['A'] },
      });
      (wrapper.vm as unknown as { clear: () => void }).clear();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]]);
    });
  });

  describe('groupBy', () => {
    const groupedObjectOptions = [
      { id: 1, name: 'New York', country: 'USA' },
      { id: 2, name: 'Los Angeles', country: 'USA' },
      { id: 3, name: 'London', country: 'UK' },
      { id: 4, name: 'Manchester', country: 'UK' },
      { id: 5, name: 'Paris', country: 'France' },
    ];

    const baseGroupProps = {
      options: groupedObjectOptions,
      optionValue: 'id',
      optionLabel: 'name',
      groupBy: 'country',
    } as const;

    describe('rendering', () => {
      it('renders group headers with correct text when groupBy is a string key', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers).toHaveLength(3);
        expect(headers[0].text()).toBe('USA');
        expect(headers[1].text()).toBe('UK');
        expect(headers[2].text()).toBe('France');
      });

      it('renders group headers when groupBy is a function', async () => {
        const wrapper = mount(KSelect, {
          props: {
            options: groupedObjectOptions,
            optionValue: 'id',
            optionLabel: 'name',
            groupBy: (option) => (option as { country: string }).country,
          },
        });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers).toHaveLength(3);
        expect(headers[0].text()).toBe('USA');
        expect(headers[1].text()).toBe('UK');
        expect(headers[2].text()).toBe('France');
      });

      it('group headers have role="presentation", not role="option"', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        for (const header of headers) {
          expect(header.attributes('role')).toBe('presentation');
        }
      });

      it('renders correct number of selectable option elements', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        expect(options).toHaveLength(5);
      });

      it('ungrouped options render without a header before named groups', async () => {
        const mixedOptions = [
          { id: 1, name: 'Solo', country: null },
          { id: 2, name: 'London', country: 'UK' },
          { id: 3, name: 'Paris', country: 'France' },
        ];
        const wrapper = mount(KSelect, {
          props: {
            options: mixedOptions,
            optionValue: 'id',
            optionLabel: 'name',
            groupBy: 'country',
          },
        });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers).toHaveLength(2);
        expect(headers[0].text()).toBe('UK');
        expect(headers[1].text()).toBe('France');
        // First option element should be the ungrouped one
        const options = getOptions(wrapper);
        expect(options[0].text()).toBe('Solo');
      });

      it('no group headers when groupBy is not set', async () => {
        const wrapper = mount(KSelect, {
          props: {
            options: groupedObjectOptions,
            optionValue: 'id',
            optionLabel: 'name',
          },
        });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers).toHaveLength(0);
      });
    });

    describe('group-label slot', () => {
      it('default renders group name text', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers[0].text()).toBe('USA');
      });

      it('custom slot receives { group, options } props', async () => {
        const wrapper = mount(KSelect, {
          props: baseGroupProps,
          slots: {
            'group-label': (props: { group: string; options: unknown[] }) =>
              `${props.group} (${props.options.length})`,
          },
        });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers[0].text()).toBe('USA (2)');
        expect(headers[1].text()).toBe('UK (2)');
        expect(headers[2].text()).toBe('France (1)');
      });

      it('works alongside the existing option slot', async () => {
        const wrapper = mount(KSelect, {
          props: baseGroupProps,
          slots: {
            'group-label': (props: { group: string }) => `Group: ${props.group}`,
            option: (props: { option: unknown }) =>
              `City: ${(props.option as { name: string }).name}`,
          },
        });
        await openSelect(wrapper);
        const headers = getGroupHeaders(wrapper);
        expect(headers[0].text()).toBe('Group: USA');
        const options = getOptions(wrapper);
        expect(options[0].text()).toBe('City: New York');
      });
    });

    describe('keyboard navigation', () => {
      it('ArrowDown/Up navigates all options sequentially, skipping headers', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const combobox = wrapper.find('[role="combobox"]');

        await combobox.trigger('keydown', { key: 'ArrowDown' }); // index 0 = New York
        expect(getOptions(wrapper)[0].attributes('data-highlighted')).toBeDefined();

        await combobox.trigger('keydown', { key: 'ArrowDown' }); // index 1 = Los Angeles
        expect(getOptions(wrapper)[1].attributes('data-highlighted')).toBeDefined();

        await combobox.trigger('keydown', { key: 'ArrowDown' }); // index 2 = London (crosses group boundary)
        expect(getOptions(wrapper)[2].attributes('data-highlighted')).toBeDefined();
      });

      it('Home/End go to first/last selectable option', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const combobox = wrapper.find('[role="combobox"]');

        await combobox.trigger('keydown', { key: 'End' });
        const options = getOptions(wrapper);
        expect(options[4].attributes('data-highlighted')).toBeDefined();

        await combobox.trigger('keydown', { key: 'Home' });
        expect(options[0].attributes('data-highlighted')).toBeDefined();
      });

      it('aria-activedescendant updates correctly with grouped options', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const combobox = wrapper.find('[role="combobox"]');

        await combobox.trigger('keydown', { key: 'ArrowDown' });
        const firstOptionId = getOptions(wrapper)[0].attributes('id');
        expect(combobox.attributes('aria-activedescendant')).toBe(firstOptionId);
      });
    });

    describe('search/filter', () => {
      it('groups with no matching options are hidden entirely', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseGroupProps, local: true },
        });
        await openSelect(wrapper);
        const input = wrapper.find('input[type="text"]');
        await input.setValue('London');
        const headers = getGroupHeaders(wrapper);
        expect(headers).toHaveLength(1);
        expect(headers[0].text()).toBe('UK');
        const options = getOptions(wrapper);
        expect(options).toHaveLength(1);
        expect(options[0].text()).toBe('London');
      });

      it('empty state shows when no options match across all groups', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseGroupProps, local: true, emptyText: 'No results' },
        });
        await openSelect(wrapper);
        const input = wrapper.find('input[type="text"]');
        await input.setValue('zzzzz');
        expect(wrapper.text()).toContain('No results');
        expect(getGroupHeaders(wrapper)).toHaveLength(0);
      });
    });

    describe('selection', () => {
      it('clicking an option in a group emits correct value', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        // Click London (3rd option, id=3)
        await options[2].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3]);
      });

      it('multiple mode selection works across groups', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseGroupProps, mode: 'multiple', modelValue: [] },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        // Select New York (USA group)
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[1]]);
      });

      it('mouseenter on grouped option updates highlightedIndex correctly', async () => {
        const wrapper = mount(KSelect, { props: baseGroupProps });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        // Hover London (index 2 in flat list)
        await options[2].trigger('mouseenter');
        expect(options[2].attributes('data-highlighted')).toBeDefined();
        // Others should not be highlighted
        expect(options[0].attributes('data-highlighted')).toBeUndefined();
        expect(options[1].attributes('data-highlighted')).toBeUndefined();
      });
    });
  });

  describe('objectValue mode', () => {
    const objectOptions = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
      { id: 3, name: 'Cherry' },
    ];

    const baseObjectProps = {
      options: objectOptions,
      optionValue: 'id',
      optionLabel: 'name',
      objectValue: true,
    } as const;

    describe('single mode', () => {
      it('emits full object when option is selected', async () => {
        const wrapper = mount(KSelect, { props: baseObjectProps });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ id: 1, name: 'Apple' }]);
      });

      it('renders pre-populated object model as display text', () => {
        const wrapper = mount(KSelect, {
          props: { ...baseObjectProps, modelValue: { id: 2, name: 'Banana' } },
        });
        expect(wrapper.find('[role="combobox"]').text()).toContain('Banana');
      });

      it('marks pre-populated object as aria-selected="true" in dropdown', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseObjectProps, modelValue: { id: 1, name: 'Apple' } },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        expect(options[0].attributes('aria-selected')).toBe('true');
        expect(options[1].attributes('aria-selected')).toBe('false');
      });

      it('deselects to null when canDeselect is true and selected option is clicked', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            modelValue: { id: 1, name: 'Apple' },
            canDeselect: true,
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
      });

      it('clears to null via clear button', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseObjectProps, modelValue: { id: 1, name: 'Apple' } },
        });
        await wrapper.find('button[aria-label="Clear selection"]').trigger('click');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
      });
    });

    describe('multiple mode', () => {
      it('emits array with full object when option is selected', async () => {
        const wrapper = mount(KSelect, {
          props: { ...baseObjectProps, mode: 'multiple', modelValue: [] },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[{ id: 1, name: 'Apple' }]]);
      });

      it('renders pre-populated object array as tags with correct text', () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            modelValue: [
              { id: 1, name: 'Apple' },
              { id: 2, name: 'Banana' },
            ],
          },
        });
        const badges = wrapper.findAllComponents({ name: 'KBadge' });
        expect(badges).toHaveLength(2);
        expect(badges[0].text()).toContain('Apple');
        expect(badges[1].text()).toContain('Banana');
      });

      it('marks pre-populated objects as aria-selected="true" in dropdown', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            modelValue: [{ id: 1, name: 'Apple' }],
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        expect(options[0].attributes('aria-selected')).toBe('true');
        expect(options[1].attributes('aria-selected')).toBe('false');
      });

      it('toggles off an already-selected object (removes from array by key)', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            modelValue: [
              { id: 1, name: 'Apple' },
              { id: 2, name: 'Banana' },
            ],
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[{ id: 2, name: 'Banana' }]]);
      });

      it('removes tag via remove button (by resolved key, not reference equality)', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            modelValue: [
              { id: 1, name: 'Apple' },
              { id: 2, name: 'Banana' },
            ],
          },
        });
        const badges = wrapper.findAllComponents({ name: 'KBadge' });
        await badges[0].vm.$emit('remove');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[{ id: 2, name: 'Banana' }]]);
      });

      it('adds second object to existing array', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            modelValue: [{ id: 1, name: 'Apple' }],
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[1].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
          [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ],
        ]);
      });
    });

    describe('tags mode with createOption', () => {
      it('creates tag as full object via Tab', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'tags',
            modelValue: [],
            createOption: true,
          },
        });
        await openSelect(wrapper);
        const input = wrapper.find('input[type="text"]');
        await input.setValue('Dragonfruit');
        await input.trigger('keydown', { key: 'Tab' });
        const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as unknown[];
        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toEqual({ id: 'Dragonfruit', name: 'Dragonfruit' });
      });

      it('creates tag as full object when createOption is a custom function', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'tags',
            modelValue: [],
            createOption: (query: string) => ({ id: query.toLowerCase(), name: query }),
          },
        });
        await openSelect(wrapper);
        const input = wrapper.find('input[type="text"]');
        await input.setValue('Dragonfruit');
        await input.trigger('keydown', { key: 'Tab' });
        const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as unknown[];
        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toEqual({ id: 'dragonfruit', name: 'Dragonfruit' });
      });

      it('does not create duplicate tag when model already holds matching object', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'tags',
            modelValue: [{ id: 'Dragonfruit', name: 'Dragonfruit' }],
            createOption: true,
          },
        });
        await openSelect(wrapper);
        const input = wrapper.find('input[type="text"]');
        await input.setValue('Dragonfruit');
        await input.trigger('keydown', { key: 'Tab' });
        // Should not emit since the value already exists
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      });

      it('created tag appears in dropdown on subsequent search (merged options)', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'tags',
            modelValue: [{ id: 'Dragonfruit', name: 'Dragonfruit' }],
            createOption: true,
            local: true,
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        const texts = options.map((o) => o.text());
        expect(texts).toContain('Dragonfruit');
      });

      it('removes created object tag', async () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'tags',
            modelValue: [
              { id: 1, name: 'Apple' },
              { id: 'Dragonfruit', name: 'Dragonfruit' },
            ],
            createOption: true,
          },
        });
        const badges = wrapper.findAllComponents({ name: 'KBadge' });
        expect(badges).toHaveLength(2);
        await badges[1].vm.$emit('remove');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[{ id: 1, name: 'Apple' }]]);
      });
    });

    describe('backward compatibility', () => {
      it('still emits primitive value when objectValue is not set (default)', async () => {
        const wrapper = mount(KSelect, {
          props: {
            options: objectOptions,
            optionValue: 'id',
            optionLabel: 'name',
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1]);
      });

      it('still emits primitive array in multiple mode when objectValue is not set', async () => {
        const wrapper = mount(KSelect, {
          props: {
            options: objectOptions,
            optionValue: 'id',
            optionLabel: 'name',
            mode: 'multiple',
            modelValue: [],
          },
        });
        await openSelect(wrapper);
        const options = getOptions(wrapper);
        await options[0].trigger('mousedown');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[1]]);
      });
    });

    describe('pre-populated model without matching option', () => {
      it('single mode: displays text from model object even if not in options list', () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            options: [],
            modelValue: { id: 99, name: 'Unknown Fruit' },
          },
        });
        expect(wrapper.find('[role="combobox"]').text()).toContain('Unknown Fruit');
      });

      it('multiple mode: displays tags from model objects even if not in options list', () => {
        const wrapper = mount(KSelect, {
          props: {
            ...baseObjectProps,
            mode: 'multiple',
            options: [],
            modelValue: [
              { id: 88, name: 'Mystery A' },
              { id: 99, name: 'Mystery B' },
            ],
          },
        });
        const badges = wrapper.findAllComponents({ name: 'KBadge' });
        expect(badges).toHaveLength(2);
        expect(badges[0].text()).toContain('Mystery A');
        expect(badges[1].text()).toContain('Mystery B');
      });
    });
  });
});
