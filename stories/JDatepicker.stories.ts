import type { Meta, StoryObj } from '@storybook/vue3';
import { JDatepicker } from '../src';

const meta = {
  title: 'Components/JDatepicker',
  component: JDatepicker,
  tags: ['autodocs'],
} satisfies Meta<typeof JDatepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Date',
    modelValue: null,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Birth Date',
    modelValue: null,
    hint: 'Select your date of birth',
  },
};

export const WithError: Story = {
  args: {
    label: 'Date',
    modelValue: null,
    error: 'Date is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date',
    modelValue: new Date(),
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Date',
    modelValue: null,
    required: true,
  },
};
