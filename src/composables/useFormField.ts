import { computed, useId, type ComputedRef } from 'vue';
import { useField, type FieldContext } from 'vee-validate';
import type { SharedFieldProps } from '../types/form';

export interface FormFieldReturn<T> {
  inputId: ComputedRef<string>;
  errorId: ComputedRef<string>;
  hintId: ComputedRef<string>;
  field: FieldContext<T> | undefined;
  resolvedError: ComputedRef<string | undefined>;
  ariaDescribedBy: ComputedRef<string | undefined>;
}

export function useFormField<T = string>(props: SharedFieldProps): FormFieldReturn<T> {
  const generatedId = useId();
  const inputId = computed(() => props.id ?? generatedId);
  const errorId = computed(() => `${inputId.value}-error`);
  const hintId = computed(() => `${inputId.value}-hint`);

  const field = props.name != null ? useField<T>(() => props.name!) : undefined;

  const resolvedError = computed(() => props.error || field?.errorMessage.value || undefined);

  const ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (props.hint) {
      ids.push(hintId.value);
    }

    if (resolvedError.value) {
      ids.push(errorId.value);
    }

    return ids.length > 0 ? ids.join(' ') : undefined;
  });

  return { inputId, errorId, hintId, field, resolvedError, ariaDescribedBy };
}
