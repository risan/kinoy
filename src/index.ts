// Components
export { default as KInput } from './components/KInput.vue';
export { default as KInputMask } from './components/KInputMask.vue';
export { default as KInputPhone } from './components/KInputPhone.vue';
export { default as KInputZip } from './components/KInputZip.vue';
export { default as KInputNumber } from './components/KInputNumber.vue';
export { default as KInputCurrency } from './components/KInputCurrency.vue';
export { default as KInputFile } from './components/KInputFile.vue';
export { default as KInputAutocomplete } from './components/KInputAutocomplete.vue';
export { default as KInputPlace } from './components/KInputPlace.vue';
export { default as KSelect } from './components/KSelect.vue';
export { default as KDatepicker } from './components/KDatepicker.vue';
export { default as KButton } from './components/KButton.vue';
export { default as KBadge } from './components/KBadge.vue';
export { default as KAlert } from './components/KAlert.vue';
export { default as KLoading } from './components/KLoading.vue';

// Icons
export {
  IconXMark,
  IconChevronDown,
  IconCloudArrowUp,
  IconFile,
  IconCircleInfo,
  IconCircleCheck,
  IconTriangleExclamation,
  IconCircleXMark,
} from './icons';

// Types
export type {
  SharedFieldProps,
  InputProps,
  InputMaskProps,
  InputNumberProps,
  InputCurrencyProps,
  InputFileProps,
  InputAutocompleteProps,
  AutocompleteOption,
  AddressData,
  InputPlaceProps,
  DatepickerValue,
  DatepickerProps,
  SelectMode,
  SelectOptionValue,
  SelectOption,
  OptionAccessor,
  GroupByAccessor,
  OptionGroup,
  SelectModelValue,
  LoadingSize,
  LoadingColor,
  LoadingProps,
  ComponentVariant,
  ComponentSize,
  ButtonType,
  ButtonProps,
  BadgeProps,
  AlertVariant,
  AlertProps,
  SelectProps,
} from './types/form';

// Plugin
export { KinoyPlugin } from './plugin';
