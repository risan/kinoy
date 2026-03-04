import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputMask } from '../src';

const meta = {
  title: 'Components/JInputMask',
  component: JInputMask,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputMask>;

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
