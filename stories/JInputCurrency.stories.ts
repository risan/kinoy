import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputCurrency } from '../src';

const meta = {
  title: 'Components/JInputCurrency',
  component: JInputCurrency,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputCurrency>;

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
