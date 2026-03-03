import type { Meta, StoryObj } from '@storybook/vue3';
import { KInputNumber } from '../src';

const meta = {
  title: 'Components/KInputNumber',
  component: KInputNumber,
  tags: ['autodocs'],
} satisfies Meta<typeof KInputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Quantity',
    modelValue: null,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Amount',
    modelValue: 1234.5,
  },
};

export const WithError: Story = {
  args: {
    label: 'Amount',
    modelValue: null,
    error: 'Amount is required',
  },
};
