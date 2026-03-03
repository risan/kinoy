import type { Meta, StoryObj } from '@storybook/vue3';
import { KInputCurrency } from '../src';

const meta = {
  title: 'Components/KInputCurrency',
  component: KInputCurrency,
  tags: ['autodocs'],
} satisfies Meta<typeof KInputCurrency>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Price',
    modelValue: null,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Total',
    modelValue: 1234.5,
  },
};

export const Euro: Story = {
  args: {
    label: 'Price',
    modelValue: 999.99,
    currency: 'EUR',
    locale: 'de-DE',
  },
};

export const WithError: Story = {
  args: {
    label: 'Price',
    modelValue: null,
    error: 'Price is required',
  },
};
