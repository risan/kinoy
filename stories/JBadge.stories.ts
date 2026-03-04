import type { Meta, StoryObj } from '@storybook/vue3';
import { JBadge } from '../src';

const meta = {
  title: 'Components/JBadge',
  component: JBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'success',
        'warning',
        'danger',
        'info',
        'outline',
        'ghost',
      ],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof JBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Default' },
};

export const Primary: Story = {
  args: { variant: 'primary', label: 'Primary' },
};

export const Success: Story = {
  args: { variant: 'success', label: 'Success' },
};

export const Warning: Story = {
  args: { variant: 'warning', label: 'Warning' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Danger' },
};

export const WithDot: Story = {
  args: { variant: 'info', label: 'Active', dot: true },
};

export const Pill: Story = {
  args: { variant: 'primary', label: 'Pill', pill: true },
};

export const Removable: Story = {
  args: { variant: 'primary', label: 'Removable', removable: true },
};

export const Outline: Story = {
  args: { variant: 'outline', label: 'Outline' },
};
