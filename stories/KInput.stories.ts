import type { Meta, StoryObj } from '@storybook/vue3';
import { KInput } from '../src';

const meta = {
  title: 'Components/KInput',
  component: KInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'url', 'tel'] },
  },
} satisfies Meta<typeof KInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Name',
    modelValue: '',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Email',
    modelValue: '',
    hint: 'We will never share your email.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    modelValue: '',
    error: 'Email is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Name',
    modelValue: 'John Doe',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    modelValue: '',
    required: true,
  },
};
