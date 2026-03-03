import type { Meta, StoryObj } from '@storybook/vue3';
import { KInputFile } from '../src';

const meta = {
  title: 'Components/KInputFile',
  component: KInputFile,
  tags: ['autodocs'],
} satisfies Meta<typeof KInputFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Upload File',
  },
};

export const WithAccept: Story = {
  args: {
    label: 'Upload Image',
    accept: 'image/*',
  },
};

export const Multiple: Story = {
  args: {
    label: 'Upload Documents',
    accept: '.pdf,.doc,.docx',
    multiple: true,
    hint: 'PDF, DOC, or DOCX files',
  },
};

export const WithError: Story = {
  args: {
    label: 'Upload File',
    error: 'File is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Upload File',
    disabled: true,
  },
};
