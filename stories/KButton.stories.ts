import type { Meta, StoryObj } from '@storybook/vue3';
import { KButton } from '../src';

const meta = {
  title: 'Components/KButton',
  component: KButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline', 'ghost'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
  },
} satisfies Meta<typeof KButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    label: 'Outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    label: 'Ghost',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Delete',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    label: 'Small',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    label: 'Large',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    label: 'Saving...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    label: 'Disabled',
    disabled: true,
  },
};

export const AsLink: Story = {
  args: {
    variant: 'primary',
    label: 'Go to page',
    href: '#',
  },
};
