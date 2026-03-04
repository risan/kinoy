// Components
export { default as JInput } from './components/JInput.vue';
export { default as JInputMask } from './components/JInputMask.vue';
export { default as JInputPhone } from './components/JInputPhone.vue';
export { default as JInputZip } from './components/JInputZip.vue';
export { default as JInputNumber } from './components/JInputNumber.vue';
export { default as JInputCurrency } from './components/JInputCurrency.vue';
export { default as JInputFile } from './components/JInputFile.vue';
export { default as JInputAutocomplete } from './components/JInputAutocomplete.vue';
export { default as JInputPlace } from './components/JInputPlace.vue';
export { default as JSelect } from './components/JSelect.vue';
export { default as JDatepicker } from './components/JDatepicker.vue';
export { default as JButton } from './components/JButton.vue';
export { default as JBadge } from './components/JBadge.vue';
export { default as JAlert } from './components/JAlert.vue';
export { default as JLoading } from './components/JLoading.vue';

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
export { JbwUiPlugin } from './plugin';
