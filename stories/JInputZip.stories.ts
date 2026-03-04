import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputZip } from '../src';

const meta = {
  title: 'Components/JInputZip',
  component: JInputZip,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputZip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Zip Code',
    modelValue: '',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Zip Code',
    modelValue: '12345',
  },
};

export const ZipPlusFour: Story = {
  args: {
    label: 'Zip Code',
    modelValue: '123456789',
  },
};
