import type { Meta, StoryObj } from '@storybook/vue3';
import { KInputPhone } from '../src';

const meta = {
  title: 'Components/KInputPhone',
  component: KInputPhone,
  tags: ['autodocs'],
} satisfies Meta<typeof KInputPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Phone Number',
    modelValue: '',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Phone Number',
    modelValue: '1234567890',
  },
};

export const Required: Story = {
  args: {
    label: 'Phone Number',
    modelValue: '',
    required: true,
  },
};
