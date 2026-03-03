import type { FactoryArg } from 'imask';
import type { CurrencyInputOptions, CurrencyDisplay } from 'vue-currency-input';

export interface SharedFieldProps {
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export interface InputProps extends SharedFieldProps {
  modelValue?: string;
  type?: string;
}

export interface InputMaskProps extends SharedFieldProps {
  modelValue?: string;
  mask: FactoryArg;
  unmask?: boolean;
}

export interface InputNumberProps extends SharedFieldProps {
  modelValue?: number | null;
  options?: CurrencyInputOptions;
}

export interface InputCurrencyProps extends SharedFieldProps {
  modelValue?: number | null;
  currency?: string;
  currencyDisplay?: CurrencyDisplay;
  locale?: string;
  hideCurrencySymbolOnFocus?: boolean;
  options?: CurrencyInputOptions;
}

export type AutocompleteOption = string | Record<string, unknown>;

export interface InputAutocompleteProps extends SharedFieldProps {
  modelValue?: string;
  search: (query: string) => Promise<AutocompleteOption[]>;
  optionLabel?: string | ((option: Record<string, unknown>) => string);
  optionValue?: string | ((option: Record<string, unknown>) => string | Promise<string>);
  debounce?: number;
  minLength?: number;
  helpText?: string;
  noResultsText?: string;
}

export interface AddressData {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

export interface InputPlaceProps extends SharedFieldProps {
  modelValue?: string;
  apiKey?: string;
  streetAddressOnly?: boolean;
  language?: string;
  region?: string;
  includedRegionCodes?: string[];
}

export interface InputFileProps extends SharedFieldProps {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
}

export type DatepickerValue = Date | Date[] | string | string[] | number | number[] | null;

export interface DatepickerProps extends SharedFieldProps {
  modelValue?: DatepickerValue;
  autoApply?: boolean;
}

export type SelectMode = 'single' | 'multiple' | 'tags';

export type SelectOptionValue = string | number | boolean;

export type SelectOption = SelectOptionValue | Record<string, unknown>;

export type OptionAccessor = string | ((option: Record<string, unknown>) => string);

export type GroupByAccessor = string | ((option: SelectOption) => string | undefined | null);

export interface OptionGroup {
  label: string | null;
  options: SelectOption[];
  startIndex: number;
}

export type SelectModelValue =
  | SelectOptionValue
  | SelectOptionValue[]
  | SelectOption
  | SelectOption[]
  | null;

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg';
export type LoadingColor = 'current' | 'primary' | 'muted';

export interface LoadingProps {
  size?: LoadingSize;
  color?: LoadingColor;
  label?: string;
  overlay?: boolean;
}

export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'ghost';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  href?: string;
  label?: string;
}

export interface BadgeProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  label?: string;
  removable?: boolean;
  removeLabel?: string;
  pill?: boolean;
  dot?: boolean;
  role?: string;
}

export type AlertVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  dismissible?: boolean;
  closeLabel?: string;
}

export interface SelectProps extends SharedFieldProps {
  modelValue?: SelectModelValue;
  options?: SelectOption[];
  optionValue?: OptionAccessor;
  optionLabel?: OptionAccessor;
  loading?: boolean;
  placeholder?: string;
  disableSearch?: boolean;
  hideClear?: boolean;
  canDeselect?: boolean;
  local?: boolean;
  searchableFields?: string[];
  mode?: SelectMode;
  createOption?: boolean | ((query: string) => SelectOption);
  emptyText?: string;
  objectValue?: boolean;
  groupBy?: GroupByAccessor;
}
