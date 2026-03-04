import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import * as yup from 'yup';
import JInputAutocomplete from '../JInputAutocomplete.vue';
import type { AutocompleteOption } from '../../types/form';
import { flushValidation, mountWithForm } from './helpers';

const mockOptions: AutocompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function createSearch(results: AutocompleteOption[] = mockOptions) {
  return vi.fn().mockResolvedValue(results);
}

async function triggerSearch(wrapper: ReturnType<typeof mount>, query: string, debounce = 300) {
  const input = wrapper.find('input');
  await input.trigger('focus');
  input.element.value = query;
  await input.trigger('input');
  vi.advanceTimersByTime(debounce);
  await flushPromises();
}

describe('JInputAutocomplete', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── v-model ──────────────────────────────────────────────

  describe('v-model', () => {
    it('displays the modelValue as input value', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: 'hello', search: createSearch() },
      });
      expect(wrapper.find('input').element.value).toBe('hello');
    });

    it('emits update:modelValue on user input', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch() },
      });
      const input = wrapper.find('input');
      input.element.value = 'test';
      await input.trigger('input');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test']);
    });

    it('updates displayed value when modelValue prop changes', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: 'initial', search: createSearch() },
      });
      await wrapper.setProps({ modelValue: 'updated' });
      expect(wrapper.find('input').element.value).toBe('updated');
    });
  });

  // ── search ───────────────────────────────────────────────

  describe('search', () => {
    it('calls search function after debounce', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = 'app';
      await input.trigger('input');

      expect(search).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      await flushPromises();

      expect(search).toHaveBeenCalledWith('app');
    });

    it('respects custom debounce value', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', debounce: 500 },
      });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = 'app';
      await input.trigger('input');

      vi.advanceTimersByTime(300);
      await flushPromises();
      expect(search).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      await flushPromises();
      expect(search).toHaveBeenCalledWith('app');
    });

    it('respects minLength prop', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', minLength: 3 },
      });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = 'ab';
      await input.trigger('input');
      vi.advanceTimersByTime(300);
      await flushPromises();

      expect(search).not.toHaveBeenCalled();

      input.element.value = 'abc';
      await input.trigger('input');
      vi.advanceTimersByTime(300);
      await flushPromises();

      expect(search).toHaveBeenCalledWith('abc');
    });

    it('displays options after search completes', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');

      const options = wrapper.findAll('[role="option"]');
      expect(options).toHaveLength(3);
      expect(options[0].text()).toBe('Apple');
      expect(options[1].text()).toBe('Banana');
    });

    it('shows loading state during search', async () => {
      const search = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = 'app';
      await input.trigger('input');

      // loading=true immediately
      expect(wrapper.text()).toContain('Searching...');
    });

    it('shows noResultsText when search returns empty', async () => {
      const search = createSearch([]);
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'xyz');

      expect(wrapper.text()).toContain('No results found');
    });

    it('shows helpText before any search', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { search: createSearch(), modelValue: '', helpText: 'Type to search' },
      });
      const input = wrapper.find('input');

      await input.trigger('focus');
      expect(wrapper.text()).toContain('Type to search');
    });

    it('shows custom noResultsText', async () => {
      const search = createSearch([]);
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', noResultsText: 'Nothing here' },
      });

      await triggerSearch(wrapper, 'xyz');
      expect(wrapper.text()).toContain('Nothing here');
    });

    it('discards stale search results', async () => {
      let resolveFirst!: (value: unknown[]) => void;
      const firstSearch = new Promise<unknown[]>((r) => {
        resolveFirst = r;
      });
      const search = vi
        .fn()
        .mockReturnValueOnce(firstSearch)
        .mockResolvedValueOnce([{ label: 'Second', value: 'second' }]);

      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });
      const input = wrapper.find('input');

      // First search
      await input.trigger('focus');
      input.element.value = 'first';
      await input.trigger('input');
      vi.advanceTimersByTime(300);
      await flushPromises();

      // Second search before first resolves
      input.element.value = 'second';
      await input.trigger('input');
      vi.advanceTimersByTime(300);
      await flushPromises();

      // Now resolve the first search (stale)
      resolveFirst([{ label: 'First', value: 'first' }]);
      await flushPromises();

      // Should show second search results, not first
      const options = wrapper.findAll('[role="option"]');
      expect(options).toHaveLength(1);
      expect(options[0].text()).toBe('Second');
    });

    it('handles search errors gracefully', async () => {
      const search = vi.fn().mockRejectedValue(new Error('Network error'));
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');

      expect(wrapper.text()).toContain('No results found');
    });
  });

  // ── option selection ─────────────────────────────────────

  describe('option selection', () => {
    it('selects option on click and emits select event', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', optionValue: 'value' },
      });

      await triggerSearch(wrapper, 'app');

      await wrapper.findAll('[role="option"]')[1].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('select')?.[0]).toEqual(['banana', mockOptions[1]]);
      expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['banana']);
    });

    it('resolves string optionValue accessor', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', optionValue: 'value' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['apple']);
    });

    it('resolves function optionValue accessor', async () => {
      const optionValue = (o: Record<string, unknown>) => `custom-${o.value}`;
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', optionValue },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['custom-apple']);
    });

    it('resolves async optionValue accessor', async () => {
      const optionValue = async (o: Record<string, unknown>) => {
        return `async-${o.value}`;
      };
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', optionValue },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['async-apple']);
    });

    it('falls back to label when async optionValue fails', async () => {
      const optionValue = async () => {
        throw new Error('fail');
      };
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '', optionValue },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['Apple']);
    });

    it('closes dropdown after selection', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');

      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
    });

    it('works with string options', async () => {
      const search = createSearch(['Foo', 'Bar', 'Baz']);
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'f');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(wrapper.emitted('select')?.[0]).toEqual(['Foo', 'Foo']);
    });
  });

  // ── keyboard navigation ──────────────────────────────────

  describe('keyboard navigation', () => {
    it('highlights next option on ArrowDown', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

      const options = wrapper.findAll('[role="option"]');
      expect(options[0].attributes('data-highlighted')).toBeDefined();
    });

    it('highlights previous option on ArrowUp', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      // ArrowUp from -1 should go to last option
      await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' });

      const options = wrapper.findAll('[role="option"]');
      expect(options[2].attributes('data-highlighted')).toBeDefined();
    });

    it('wraps around on ArrowDown', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');

      const input = wrapper.find('input');
      await input.trigger('keydown', { key: 'ArrowDown' }); // 0
      await input.trigger('keydown', { key: 'ArrowDown' }); // 1
      await input.trigger('keydown', { key: 'ArrowDown' }); // 2
      await input.trigger('keydown', { key: 'ArrowDown' }); // wraps to 0

      const options = wrapper.findAll('[role="option"]');
      expect(options[0].attributes('data-highlighted')).toBeDefined();
    });

    it('selects highlighted option on Enter', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });
      await flushPromises();

      expect(wrapper.emitted('select')).toHaveLength(1);
    });

    it('does not select on Enter when nothing is highlighted', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('select')).toBeUndefined();
    });

    it('closes dropdown on Escape', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');

      await wrapper.find('input').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
    });
  });

  // ── dropdown behavior ────────────────────────────────────

  describe('dropdown behavior', () => {
    it('opens on focus when helpText is provided', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { search: createSearch(), modelValue: '', helpText: 'Type to search' },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
    });

    it('does not open on focus when helpText is empty', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { search: createSearch(), modelValue: '', helpText: '' },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
    });

    it('closes on blur', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { search: createSearch(), modelValue: '' },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');

      await wrapper.find('input').trigger('blur');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
    });

    it('reopens dropdown on new input after Escape', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.find('input').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');

      // Type again — should reopen
      const input = wrapper.find('input');
      input.element.value = 'ban';
      await input.trigger('input');
      // loading becomes true → dropdown should show
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
    });
  });

  // ── vee-validate integration ─────────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      address: yup.string().required('Address is required'),
    });

    it('displays validation error after blur', async () => {
      const wrapper = mountWithForm(JInputAutocomplete, schema, 'address', {
        search: createSearch(),
      });
      const input = wrapper.find('input');

      input.element.value = '';
      await input.trigger('input');
      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Address is required');
    });

    it('clears validation error when field becomes valid', async () => {
      const wrapper = mountWithForm(JInputAutocomplete, schema, 'address', {
        search: createSearch(),
      });
      const input = wrapper.find('input');

      input.element.value = '';
      await input.trigger('input');
      await input.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('Address is required');

      input.element.value = '123 Main St';
      await input.trigger('input');
      await flushValidation();
      expect(wrapper.text()).not.toContain('Address is required');
    });
  });

  // ── error states ─────────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('applies error styling', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), error: 'Error' },
      });
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('manual error takes priority over vee-validate error', async () => {
      const schema = yup.object({
        field: yup.string().required('Field required'),
      });
      const wrapper = mountWithForm(JInputAutocomplete, schema, 'field', {
        search: createSearch(),
        error: 'Manual error',
      });
      const input = wrapper.find('input');

      await input.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  // ── disabled state ───────────────────────────────────────

  describe('disabled state', () => {
    it('sets disabled attribute on input', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), disabled: true },
      });
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
      expect(wrapper.find('input').attributes('aria-disabled')).toBe('true');
    });

    it('does not open dropdown when disabled', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), disabled: true, helpText: 'Type' },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
    });
  });

  // ── label ────────────────────────────────────────────────

  describe('label', () => {
    it('renders label when provided', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), label: 'Address' },
      });
      expect(wrapper.find('label').text()).toBe('Address');
    });

    it('associates label with input via for/id', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), label: 'Address' },
      });
      expect(wrapper.find('label').attributes('for')).toBe(wrapper.find('input').attributes('id'));
    });
  });

  // ── accessibility ────────────────────────────────────────

  describe('accessibility', () => {
    it('has combobox role on input', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch() },
      });
      expect(wrapper.find('input').attributes('role')).toBe('combobox');
    });

    it('has aria-autocomplete="list"', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch() },
      });
      expect(wrapper.find('input').attributes('aria-autocomplete')).toBe('list');
    });

    it('sets aria-expanded based on dropdown visibility', async () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch() },
      });
      const input = wrapper.find('input');

      expect(input.attributes('aria-expanded')).toBe('false');

      await input.trigger('focus');
      await triggerSearch(wrapper, 'app');
      expect(input.attributes('aria-expanded')).toBe('true');
    });

    it('sets aria-activedescendant on keyboard navigation', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
      });

      await triggerSearch(wrapper, 'app');
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

      const input = wrapper.find('input');
      const firstOption = wrapper.findAll('[role="option"]')[0];
      expect(input.attributes('aria-activedescendant')).toBe(firstOption.attributes('id'));
    });

    it('error message has role="alert"', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });

    it('sets aria-describedby for hint and error', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), hint: 'Hint', error: 'Error' },
      });
      const input = wrapper.find('input');
      const describedby = input.attributes('aria-describedby')!;
      expect(describedby).toContain(wrapper.find('[id$="-hint"]').attributes('id'));
      expect(describedby).toContain(wrapper.find('[role="alert"]').attributes('id'));
    });
  });

  // ── hint ─────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), hint: 'Enter your address' },
      });
      expect(wrapper.text()).toContain('Enter your address');
    });
  });

  // ── required ─────────────────────────────────────────────

  describe('required', () => {
    it('shows asterisk in label when required', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), label: 'Address', required: true },
      });
      expect(wrapper.find('label').text()).toContain('*');
    });

    it('sets native required attribute', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch(), required: true },
      });
      expect(wrapper.find('input').attributes('required')).toBeDefined();
    });
  });

  // ── attribute passthrough ────────────────────────────────

  describe('attribute passthrough', () => {
    it('passes HTML attributes to input', () => {
      const wrapper = mount(JInputAutocomplete, {
        props: { modelValue: '', search: createSearch() },
        attrs: { placeholder: 'Search...', maxlength: '100' },
      });
      expect(wrapper.find('input').attributes('placeholder')).toBe('Search...');
      expect(wrapper.find('input').attributes('maxlength')).toBe('100');
    });
  });

  // ── option slot ──────────────────────────────────────────

  describe('option slot', () => {
    it('supports custom option rendering via slot', async () => {
      const search = createSearch();
      const wrapper = mount(JInputAutocomplete, {
        props: { search, modelValue: '' },
        slots: {
          option: ({ option }: { option: AutocompleteOption }) =>
            `Custom: ${(option as Record<string, unknown>).label}`,
        },
      });

      await triggerSearch(wrapper, 'app');

      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('Custom: Apple');
    });
  });
});
