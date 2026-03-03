import type { Meta, StoryObj } from '@storybook/vue3';
import { KAlert } from '../src';

const meta = {
  title: 'Components/KAlert',
  component: KAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof KAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Heads up!',
    description: 'This is a default alert with helpful information.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    description: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    description: 'Please review your input before proceeding.',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    description: 'A new version is available.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissible',
    description: 'Click the X to dismiss this alert.',
    dismissible: true,
  },
};
