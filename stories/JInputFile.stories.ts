import type { Meta, StoryObj } from '@storybook/vue3';
import { JInputFile } from '../src';

const meta = {
  title: 'Components/JInputFile',
  component: JInputFile,
  tags: ['autodocs'],
} satisfies Meta<typeof JInputFile>;

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
