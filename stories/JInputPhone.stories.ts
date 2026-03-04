import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputPhone } from '../src';

const meta = {
  title: 'Components/JInputPhone',
  component: JInputPhone,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputPhone>;

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
