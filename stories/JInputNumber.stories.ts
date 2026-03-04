import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputNumber } from '../src';

const meta = {
  title: 'Components/JInputNumber',
  component: JInputNumber,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputNumber>;

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
