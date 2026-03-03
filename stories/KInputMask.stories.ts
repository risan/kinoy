import type { Meta, StoryObj } from '@storybook/vue3';
import { KInputMask } from '../src';

const meta = {
  title: 'Components/KInputMask',
  component: KInputMask,
  tags: ['autodocs'],
} satisfies Meta<typeof KInputMask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PhoneMask: Story = {
  args: {
    label: 'Phone',
    modelValue: '',
    mask: { mask: '000-000-0000' },
  },
};

export const ZipMask: Story = {
  args: {
    label: 'Zip Code',
    modelValue: '',
    mask: { mask: '00000[-0000]' },
  },
};

export const WithError: Story = {
  args: {
    label: 'Phone',
    modelValue: '',
    mask: { mask: '000-000-0000' },
    error: 'Invalid phone number',
  },
};
