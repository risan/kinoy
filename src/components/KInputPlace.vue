<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import KInputAutocomplete from './KInputAutocomplete.vue';
import type { InputPlaceProps, AddressData, AutocompleteOption } from '../types/form';

defineOptions({
  name: 'KInputPlace',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputPlaceProps>(), {
  streetAddressOnly: false,
  language: 'en',
  region: 'us',
  includedRegionCodes: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select-address': [data: AddressData];
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let places: any;
const loadingLibrary = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sessionToken = ref<any>(null);
let isMounted = true;

interface PlaceSuggestionOption {
  label: string;
  place: {
    fetchFields: (options: { fields: string[] }) => Promise<void>;
    addressComponents: Array<{
      types: string[];
      longText: string;
      shortText: string;
    }>;
  };
}

function getAddressComponent(
  components: PlaceSuggestionOption['place']['addressComponents'],
  type: string,
  short = false,
): string {
  const component = components.find((c) => c.types.includes(type));
  return component ? (short ? component.shortText : component.longText) : '';
}

function getStreetAddress(components: PlaceSuggestionOption['place']['addressComponents']): string {
  const streetNumber = getAddressComponent(components, 'street_number');
  const streetName = getAddressComponent(components, 'route');
  return `${streetNumber ? streetNumber + ' ' : ''}${streetName}`;
}

const searchPlaces = async (query: string): Promise<AutocompleteOption[]> => {
  const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: query,
    language: props.language,
    region: props.region,
    ...(props.includedRegionCodes.length > 0
      ? { includedRegionCodes: props.includedRegionCodes }
      : {}),
    sessionToken: sessionToken.value,
  });

  return suggestions.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ placePrediction }: { placePrediction: any }) => ({
      label: placePrediction.text.toString(),
      place: placePrediction.toPlace(),
    }),
  );
};

const resolveOptionValue = async (option: Record<string, unknown>): Promise<string> => {
  const placeOption = option as unknown as PlaceSuggestionOption;
  await placeOption.place.fetchFields({ fields: ['addressComponents'] });

  return props.streetAddressOnly
    ? getStreetAddress(placeOption.place.addressComponents)
    : (option.label as string);
};

function onSelect(_value: string, option: AutocompleteOption) {
  const placeOption = option as unknown as PlaceSuggestionOption;
  const components = placeOption.place.addressComponents;

  const addressData: AddressData = {
    streetAddress: getStreetAddress(components),
    city: getAddressComponent(components, 'locality'),
    state: getAddressComponent(components, 'administrative_area_level_1', true),
    zip: getAddressComponent(components, 'postal_code'),
  };

  emit('select-address', addressData);
}

function onUpdateModelValue(value: string) {
  emit('update:modelValue', value);
}

onMounted(async () => {
  loadingLibrary.value = true;

  try {
    if (!window.google?.maps) {
      if (!props.apiKey) {
        console.warn('[KInputPlace] apiKey prop is required when Google Maps is not pre-loaded.');
        return;
      }

      setOptions({
        key: props.apiKey,
        v: 'weekly',
      });
    }

    if (window.google?.maps?.places) {
      places = window.google.maps.places;
    } else {
      places = await importLibrary('places');
    }

    sessionToken.value = new places.AutocompleteSessionToken();
  } finally {
    if (isMounted) {
      loadingLibrary.value = false;
    }
  }
});

onBeforeUnmount(() => {
  isMounted = false;
});
</script>

<template>
  <KInputAutocomplete
    v-bind="$attrs"
    :id="id"
    :name="name"
    :label="label"
    :hint="hint"
    :error="error"
    :disabled="disabled || loadingLibrary"
    :required="required"
    :model-value="modelValue"
    :search="searchPlaces"
    :option-value="resolveOptionValue"
    help-text="Start typing an address..."
    @update:model-value="onUpdateModelValue"
    @select="onSelect"
  />
</template>
