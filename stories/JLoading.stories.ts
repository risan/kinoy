import type { Meta, StoryObj } from '@storybook/vue3';
import { JLoading } from '../src';

const meta = {
  title: 'Components/JLoading',
  component: JLoading,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    color: { control: 'select', options: ['current', 'primary', 'muted'] },
  },
} satisfies Meta<typeof JLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExtraSmall: Story = {
  args: { size: 'xs' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const PrimaryColor: Story = {
  args: { color: 'primary' },
};

export const WithLabel: Story = {
  args: { color: 'primary', label: 'Loading data...' },
};

export const Overlay: Story = {
  args: { overlay: true },
  decorators: [
    () => ({
      template:
        '<div style="position: relative; height: 200px; border: 1px solid #ddd; border-radius: 8px;"><story /></div>',
    }),
  ],
};
