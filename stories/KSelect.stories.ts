import type { Meta, StoryObj } from '@storybook/vue3';
import { KSelect } from '../src';

const meta = {
  title: 'Components/KSelect',
  component: KSelect,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['single', 'multiple', 'tags'] },
  },
} satisfies Meta<typeof KSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

export const Default: Story = {
  args: {
    label: 'Fruit',
    options: fruits,
    placeholder: 'Pick a fruit',
  },
};

export const WithObjectOptions: Story = {
  args: {
    label: 'City',
    options: [
      { id: 1, name: 'New York' },
      { id: 2, name: 'London' },
      { id: 3, name: 'Tokyo' },
      { id: 4, name: 'Paris' },
    ],
    optionValue: 'id',
    optionLabel: 'name',
    placeholder: 'Select a city',
  },
};

export const Multiple: Story = {
  args: {
    label: 'Fruits',
    options: fruits,
    mode: 'multiple',
    placeholder: 'Select fruits',
  },
};

export const Tags: Story = {
  args: {
    label: 'Tags',
    options: fruits,
    mode: 'tags',
    createOption: true,
    placeholder: 'Add tags',
  },
};

export const WithError: Story = {
  args: {
    label: 'Fruit',
    options: fruits,
    error: 'Please select a fruit',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Fruit',
    options: fruits,
    disabled: true,
    modelValue: 'Apple',
  },
};

export const Loading: Story = {
  args: {
    label: 'Fruit',
    options: [],
    loading: true,
    placeholder: 'Loading...',
  },
};

export const LocalSearch: Story = {
  args: {
    label: 'Fruit',
    options: fruits,
    local: true,
    placeholder: 'Search fruits...',
  },
};
