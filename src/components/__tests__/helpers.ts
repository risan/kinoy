import { vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, type Component } from 'vue';
import { useForm } from 'vee-validate';
import type * as yup from 'yup';

export const flushIMask = flushPromises;
export const flushCurrencyInput = flushPromises;

export async function typeIntoCurrencyInput(
  input: ReturnType<ReturnType<typeof mount>['find']>,
  text: string,
) {
  const el = input.element as HTMLInputElement;
  el.value = text;
  await input.trigger('input');
  await flushCurrencyInput();
}

// vee-validate uses internal macrotask scheduling (nested setTimeout)
// for form-level yup validation. Advancing fake timers flushes those.
export async function flushValidation() {
  vi.advanceTimersByTime(10);
  await flushPromises();
}

// Simulate user typing into a masked input
export async function typeIntoMask(
  input: ReturnType<ReturnType<typeof mount>['find']>,
  text: string,
) {
  const el = input.element as HTMLInputElement;
  el.value = text;
  await input.trigger('input');
  await flushIMask();
}

// Wraps a component in a useForm context with yup validation
export function mountWithForm(
  component: Component,
  schema: yup.ObjectSchema<Record<string, unknown>>,
  fieldName: string,
  inputProps: Record<string, unknown> = {},
  initialValue: unknown = '',
) {
  const Wrapper = defineComponent({
    setup() {
      useForm({
        validationSchema: schema,
        initialValues: { [fieldName]: initialValue },
      });
      return () => h(component, { name: fieldName, ...inputProps });
    },
  });
  return mount(Wrapper);
}

export async function openSelect(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('[role="combobox"]').trigger('click');
}

export function getOptions(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[role="option"]');
}

export function getGroupHeaders(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[role="presentation"]');
}

export function createFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

export async function selectFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.find('input[type="file"]');
  const fileList = Object.create(null);
  files.forEach((f, i) => (fileList[i] = f));
  fileList.length = files.length;
  fileList[Symbol.iterator] = function* () {
    for (let i = 0; i < this.length; i++) yield this[i];
  };
  Object.defineProperty(input.element, 'files', {
    value: fileList,
    configurable: true,
  });
  await input.trigger('change');
}
