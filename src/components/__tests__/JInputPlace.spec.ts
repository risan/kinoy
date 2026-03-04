import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import JInputPlace from '../JInputPlace.vue';

// Mock @googlemaps/js-api-loader
const mockSetOptions = vi.fn();
const mockImportLibrary = vi.fn();

vi.mock('@googlemaps/js-api-loader', () => ({
  setOptions: (...args: unknown[]) => mockSetOptions(...args),
  importLibrary: (...args: unknown[]) => mockImportLibrary(...args),
}));

const mockAddressComponents = [
  { types: ['street_number'], longText: '123', shortText: '123' },
  { types: ['route'], longText: 'Main Street', shortText: 'Main St' },
  { types: ['locality'], longText: 'New York', shortText: 'New York' },
  { types: ['administrative_area_level_1'], longText: 'New York', shortText: 'NY' },
  { types: ['postal_code'], longText: '10001', shortText: '10001' },
];

function createMockPlace(components = mockAddressComponents) {
  return {
    fetchFields: vi.fn().mockResolvedValue(undefined),
    addressComponents: components,
  };
}

function createMockPlaces(placeFactory = () => createMockPlace()) {
  return {
    AutocompleteSessionToken: vi.fn(),
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({
        suggestions: [
          {
            placePrediction: {
              text: { toString: () => '123 Main Street, New York, NY 10001' },
              toPlace: placeFactory,
            },
          },
          {
            placePrediction: {
              text: { toString: () => '456 Oak Avenue, Los Angeles, CA 90001' },
              toPlace: () =>
                createMockPlace([
                  { types: ['street_number'], longText: '456', shortText: '456' },
                  { types: ['route'], longText: 'Oak Avenue', shortText: 'Oak Ave' },
                  { types: ['locality'], longText: 'Los Angeles', shortText: 'Los Angeles' },
                  {
                    types: ['administrative_area_level_1'],
                    longText: 'California',
                    shortText: 'CA',
                  },
                  { types: ['postal_code'], longText: '90001', shortText: '90001' },
                ]),
            },
          },
        ],
      }),
    },
  };
}

async function triggerSearch(wrapper: ReturnType<typeof mount>, query: string, debounce = 300) {
  const input = wrapper.find('input');
  await input.trigger('focus');
  input.element.value = query;
  await input.trigger('input');
  vi.advanceTimersByTime(debounce);
  await flushPromises();
}

describe('JInputPlace', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset window.google
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).google;
    mockSetOptions.mockClear();
    mockImportLibrary.mockClear();
  });

  afterEach(() => vi.useRealTimers());

  // ── Google Maps loading ────────────────────────────────

  describe('Google Maps loading', () => {
    it('loads library via importLibrary on mount', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await flushPromises();

      expect(mockSetOptions).toHaveBeenCalledWith({
        key: 'test-key',
        v: 'weekly',
      });
      expect(mockImportLibrary).toHaveBeenCalledWith('places');
    });

    it('uses existing Google Maps library if available', async () => {
      const mockPlaces = createMockPlaces();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google = {
        maps: { places: mockPlaces },
      };

      mount(JInputPlace, {
        props: { modelValue: '' },
      });
      await flushPromises();

      expect(mockImportLibrary).not.toHaveBeenCalled();
    });

    it('disables input while library is loading', async () => {
      mockImportLibrary.mockReturnValue(new Promise(() => {})); // never resolves

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await wrapper.vm.$nextTick();

      // Library is loading — input should be disabled
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not warn and waits when apiKey is not yet provided', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const wrapper = mount(JInputPlace, {
        props: { modelValue: '' },
      });
      await flushPromises();

      expect(warn).not.toHaveBeenCalled();
      expect(mockImportLibrary).not.toHaveBeenCalled();
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
      warn.mockRestore();
    });

    it('loads library when apiKey prop becomes available', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '' },
      });
      await flushPromises();

      expect(mockImportLibrary).not.toHaveBeenCalled();
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();

      await wrapper.setProps({ apiKey: 'test-key' });
      await flushPromises();

      expect(mockSetOptions).toHaveBeenCalledWith({ key: 'test-key', v: 'weekly' });
      expect(mockImportLibrary).toHaveBeenCalledWith('places');
      expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
    });

    it('enables input after library loads', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await flushPromises();

      expect(wrapper.find('input').attributes('disabled')).toBeUndefined();
    });
  });

  // ── search ───────────────────────────────────────────────

  describe('search', () => {
    it('calls fetchAutocompleteSuggestions with correct params', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: {
          modelValue: '',
          apiKey: 'test-key',
          language: 'fr',
          region: 'ca',
          includedRegionCodes: ['ca'],
        },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123 Main');

      expect(mockPlaces.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          input: '123 Main',
          language: 'fr',
          region: 'ca',
          includedRegionCodes: ['ca'],
        }),
      );
    });

    it('displays suggestion labels in dropdown', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123');

      const options = wrapper.findAll('[role="option"]');
      expect(options).toHaveLength(2);
      expect(options[0].text()).toContain('123 Main Street');
    });
  });

  // ── address selection ────────────────────────────────────

  describe('address selection', () => {
    it('emits select-address with parsed address data', async () => {
      const mockPlace = createMockPlace();
      const mockPlaces = createMockPlaces(() => mockPlace);
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      expect(mockPlace.fetchFields).toHaveBeenCalledWith({
        fields: ['addressComponents'],
      });

      const emitted = wrapper.emitted('select-address');
      expect(emitted).toHaveLength(1);
      expect(emitted![0][0]).toEqual({
        streetAddress: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      });
    });

    it('handles missing address components', async () => {
      const mockPlace = createMockPlace([
        { types: ['route'], longText: 'Main Street', shortText: 'Main St' },
        { types: ['locality'], longText: 'New York', shortText: 'New York' },
      ]);
      const mockPlaces = createMockPlaces(() => mockPlace);
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      const emitted = wrapper.emitted('select-address')!;
      expect(emitted[0][0]).toEqual({
        streetAddress: 'Main Street',
        city: 'New York',
        state: '',
        zip: '',
      });
    });
  });

  // ── streetAddressOnly ────────────────────────────────────

  describe('streetAddressOnly', () => {
    it('sets input value to street address only when true', async () => {
      const mockPlace = createMockPlace();
      const mockPlaces = createMockPlaces(() => mockPlace);
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key', streetAddressOnly: true },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      const modelUpdates = wrapper.emitted('update:modelValue')!;
      // Last emission should be the street address
      expect(modelUpdates[modelUpdates.length - 1]).toEqual(['123 Main Street']);
    });

    it('sets input value to full text when false', async () => {
      const mockPlace = createMockPlace();
      const mockPlaces = createMockPlaces(() => mockPlace);
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key', streetAddressOnly: false },
      });
      await flushPromises();

      await triggerSearch(wrapper, '123');
      await wrapper.findAll('[role="option"]')[0].trigger('mousedown');
      await flushPromises();

      const modelUpdates = wrapper.emitted('update:modelValue')!;
      expect(modelUpdates[modelUpdates.length - 1]).toEqual([
        '123 Main Street, New York, NY 10001',
      ]);
    });
  });

  // ── props passthrough ────────────────────────────────────

  describe('props passthrough', () => {
    it('passes label prop to JInputAutocomplete', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key', label: 'Address' },
      });
      await flushPromises();

      expect(wrapper.find('label').text()).toBe('Address');
    });

    it('passes error prop to JInputAutocomplete', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key', error: 'Invalid' },
      });
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid');
    });

    it('passes attrs to JInputAutocomplete', async () => {
      const mockPlaces = createMockPlaces();
      mockImportLibrary.mockResolvedValue(mockPlaces);

      const wrapper = mount(JInputPlace, {
        props: { modelValue: '', apiKey: 'test-key' },
        attrs: { placeholder: 'Enter address' },
      });
      await flushPromises();

      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter address');
    });
  });
});
