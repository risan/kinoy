import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import * as yup from 'yup';
import JInputFile from '../JInputFile.vue';
import { flushValidation, mountWithForm, createFile, selectFiles } from './helpers';

// ── Helpers ─────────────────────────────────────────────────

async function dropFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
  const dropZone = wrapper.find('[role="button"]');
  await dropZone.trigger('drop', {
    dataTransfer: { files },
  });
}

describe('JInputFile', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── 2.1 File selection (click-to-browse) ──────────────────

  describe('file selection', () => {
    it('emits update:files with [file] when a single file is selected', async () => {
      const wrapper = mount(JInputFile);
      const file = createFile('doc.pdf', 1024, 'application/pdf');

      await selectFiles(wrapper, [file]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[file]]);
    });

    it('in single mode, replaces existing file on new selection', async () => {
      const wrapper = mount(JInputFile);
      const file1 = createFile('a.pdf', 100, 'application/pdf');
      const file2 = createFile('b.pdf', 200, 'application/pdf');

      await selectFiles(wrapper, [file1]);
      await selectFiles(wrapper, [file2]);

      expect(wrapper.emitted('update:files')?.[1]).toEqual([[file2]]);
    });

    it('in multiple mode, appends new files to existing', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true } });
      const file1 = createFile('a.pdf', 100, 'application/pdf');
      const file2 = createFile('b.pdf', 200, 'application/pdf');

      await selectFiles(wrapper, [file1]);
      await selectFiles(wrapper, [file2]);

      expect(wrapper.emitted('update:files')?.[1]).toEqual([[file1, file2]]);
    });

    it('resets native input value after processing', async () => {
      const wrapper = mount(JInputFile);
      const input = wrapper.find('input[type="file"]');
      const file = createFile('doc.pdf', 1024, 'application/pdf');

      await selectFiles(wrapper, [file]);

      expect((input.element as HTMLInputElement).value).toBe('');
    });
  });

  // ── 2.2 Drag and drop ────────────────────────────────────

  describe('drag and drop', () => {
    it('emits update:files when valid files are dropped', async () => {
      const wrapper = mount(JInputFile);
      const file = createFile('photo.png', 2048, 'image/png');

      await dropFiles(wrapper, [file]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[file]]);
    });

    it('adds visual indicator class during dragover', async () => {
      const wrapper = mount(JInputFile);
      const dropZone = wrapper.find('[role="button"]');

      await dropZone.trigger('dragenter', {
        dataTransfer: { files: [] },
      });

      expect(dropZone.classes()).toContain('border-primary');
    });

    it('removes visual indicator on drop', async () => {
      const wrapper = mount(JInputFile);
      const dropZone = wrapper.find('[role="button"]');
      const file = createFile('photo.png', 2048, 'image/png');

      await dropZone.trigger('dragenter', {
        dataTransfer: { files: [] },
      });
      await dropFiles(wrapper, [file]);

      expect(dropZone.classes()).not.toContain('border-primary');
    });

    it('removes visual indicator on dragleave', async () => {
      const wrapper = mount(JInputFile);
      const dropZone = wrapper.find('[role="button"]');

      await dropZone.trigger('dragenter', {
        dataTransfer: { files: [] },
      });
      await dropZone.trigger('dragleave');

      expect(dropZone.classes()).not.toContain('border-primary');
    });

    it('does not process drop when disabled', async () => {
      const wrapper = mount(JInputFile, { props: { disabled: true } });
      const file = createFile('photo.png', 2048, 'image/png');

      await dropFiles(wrapper, [file]);

      expect(wrapper.emitted('update:files')).toBeUndefined();
    });

    it('filters dropped files by accept="image/*"', async () => {
      const wrapper = mount(JInputFile, { props: { accept: 'image/*' } });
      const txt = createFile('notes.txt', 100, 'text/plain');
      const png = createFile('photo.png', 2048, 'image/png');

      await dropFiles(wrapper, [txt, png]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[png]]);
    });

    it('filters dropped files by accept=".pdf"', async () => {
      const wrapper = mount(JInputFile, { props: { accept: '.pdf' } });
      const txt = createFile('notes.txt', 100, 'text/plain');
      const pdf = createFile('doc.pdf', 1024, 'application/pdf');

      await dropFiles(wrapper, [txt, pdf]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[pdf]]);
    });

    it('in single mode, only takes first valid file from multi-file drop', async () => {
      const wrapper = mount(JInputFile);
      const file1 = createFile('a.pdf', 100, 'application/pdf');
      const file2 = createFile('b.pdf', 200, 'application/pdf');

      await dropFiles(wrapper, [file1, file2]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[file1]]);
    });
  });

  // ── 2.3 File list display ─────────────────────────────────

  describe('file list display', () => {
    it('renders file name and human-readable size for each selected file', async () => {
      const wrapper = mount(JInputFile);
      const file = createFile('report.pdf', 1024, 'application/pdf');

      await selectFiles(wrapper, [file]);

      expect(wrapper.text()).toContain('report.pdf');
      expect(wrapper.text()).toContain('1.0 KB');
    });

    it('does not render the file list when no files are selected', () => {
      const wrapper = mount(JInputFile);

      expect(wrapper.find('ul').exists()).toBe(false);
    });

    it('formats sizes correctly', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true } });
      const fileBytes = createFile('tiny.txt', 500, 'text/plain');
      const fileKb = createFile('medium.txt', 1536, 'text/plain'); // 1.5 KB
      const fileMb = createFile('large.bin', 2_621_440, 'application/octet-stream'); // 2.5 MB

      await selectFiles(wrapper, [fileBytes, fileKb, fileMb]);

      expect(wrapper.text()).toContain('500 B');
      expect(wrapper.text()).toContain('1.5 KB');
      expect(wrapper.text()).toContain('2.5 MB');
    });
  });

  // ── 2.4 File removal ─────────────────────────────────────

  describe('file removal', () => {
    it('removes the file from the list when remove button is clicked', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true } });
      const file1 = createFile('a.pdf', 100, 'application/pdf');
      const file2 = createFile('b.pdf', 200, 'application/pdf');

      await selectFiles(wrapper, [file1, file2]);
      const removeButtons = wrapper.findAll('button[aria-label]');
      await removeButtons[0].trigger('click');

      expect(wrapper.text()).not.toContain('a.pdf');
      expect(wrapper.text()).toContain('b.pdf');
    });

    it('emits updated update:files after removal', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true } });
      const file1 = createFile('a.pdf', 100, 'application/pdf');
      const file2 = createFile('b.pdf', 200, 'application/pdf');

      await selectFiles(wrapper, [file1, file2]);
      const removeButtons = wrapper.findAll('button[aria-label]');
      await removeButtons[0].trigger('click');

      const emissions = wrapper.emitted('update:files')!;
      expect(emissions[emissions.length - 1]).toEqual([[file2]]);
    });

    it('emits empty array when the last file is removed', async () => {
      const wrapper = mount(JInputFile);
      const file = createFile('doc.pdf', 1024, 'application/pdf');

      await selectFiles(wrapper, [file]);
      const removeButton = wrapper.find('button[aria-label]');
      await removeButton.trigger('click');

      const emissions = wrapper.emitted('update:files')!;
      expect(emissions[emissions.length - 1]).toEqual([[]]);
    });
  });

  // ── maxFiles ────────────────────────────────────────────

  describe('maxFiles', () => {
    it('truncates to maxFiles when selecting more files than allowed', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 2 } });
      const f1 = createFile('a.pdf', 100, 'application/pdf');
      const f2 = createFile('b.pdf', 200, 'application/pdf');
      const f3 = createFile('c.pdf', 300, 'application/pdf');

      await selectFiles(wrapper, [f1, f2, f3]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[f1, f2]]);
    });

    it('truncates combined files when appending exceeds maxFiles', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 3 } });
      const f1 = createFile('a.pdf', 100, 'application/pdf');
      const f2 = createFile('b.pdf', 200, 'application/pdf');
      const f3 = createFile('c.pdf', 300, 'application/pdf');
      const f4 = createFile('d.pdf', 400, 'application/pdf');

      await selectFiles(wrapper, [f1, f2]);
      await selectFiles(wrapper, [f3, f4]);

      expect(wrapper.emitted('update:files')?.[1]).toEqual([[f1, f2, f3]]);
    });

    it('disables input when maxFiles is reached', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 1 } });
      const file = createFile('a.pdf', 100, 'application/pdf');

      await selectFiles(wrapper, [file]);

      const dropZone = wrapper.find('[role="button"]');
      expect(dropZone.attributes('aria-disabled')).toBe('true');
      expect(dropZone.attributes('tabindex')).toBe('-1');
      expect(wrapper.find('input[type="file"]').attributes('disabled')).toBeDefined();
    });

    it('re-enables input after removing a file below maxFiles', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 1 } });
      const file = createFile('a.pdf', 100, 'application/pdf');

      await selectFiles(wrapper, [file]);
      expect(wrapper.find('[role="button"]').attributes('aria-disabled')).toBe('true');

      const removeButton = wrapper.find('button[aria-label]');
      await removeButton.trigger('click');

      expect(wrapper.find('[role="button"]').attributes('aria-disabled')).toBeUndefined();
      expect(wrapper.find('[role="button"]').attributes('tabindex')).toBe('0');
    });

    it('does not allow click when maxFiles is reached', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 1 } });
      const file = createFile('a.pdf', 100, 'application/pdf');

      await selectFiles(wrapper, [file]);

      const input = wrapper.find('input[type="file"]');
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');
      await wrapper.find('[role="button"]').trigger('click');

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('does not process drop when maxFiles is reached', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 1 } });
      const f1 = createFile('a.pdf', 100, 'application/pdf');
      const f2 = createFile('b.pdf', 200, 'application/pdf');

      await selectFiles(wrapper, [f1]);
      await dropFiles(wrapper, [f2]);

      const emissions = wrapper.emitted('update:files')!;
      expect(emissions).toHaveLength(1);
    });

    it('truncates dropped files to maxFiles', async () => {
      const wrapper = mount(JInputFile, { props: { multiple: true, maxFiles: 2 } });
      const f1 = createFile('a.pdf', 100, 'application/pdf');
      const f2 = createFile('b.pdf', 200, 'application/pdf');
      const f3 = createFile('c.pdf', 300, 'application/pdf');

      await dropFiles(wrapper, [f1, f2, f3]);

      expect(wrapper.emitted('update:files')?.[0]).toEqual([[f1, f2]]);
    });
  });

  // ── 2.5 vee-validate integration ─────────────────────────

  describe('vee-validate integration', () => {
    const schema = yup.object({
      document: yup.array().min(1, 'File is required').required('File is required'),
    });

    it('displays validation error after field is blurred while invalid', async () => {
      const wrapper = mountWithForm(JInputFile, schema, 'document', {}, []);
      const dropZone = wrapper.find('[role="button"]');

      await dropZone.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('File is required');
    });

    it('clears validation error when valid files are added', async () => {
      const wrapper = mountWithForm(JInputFile, schema, 'document', {}, []);
      const dropZone = wrapper.find('[role="button"]');

      // Trigger error
      await dropZone.trigger('blur');
      await flushValidation();
      expect(wrapper.text()).toContain('File is required');

      // Add a file
      const file = createFile('doc.pdf', 1024, 'application/pdf');
      const baseInputFile = wrapper.findComponent(JInputFile);
      await selectFiles(baseInputFile, [file]);
      await flushValidation();

      expect(wrapper.text()).not.toContain('File is required');
    });

    it('emits update:files even in vee-validate mode', async () => {
      const wrapper = mountWithForm(JInputFile, schema, 'document', {}, []);
      const baseInputFile = wrapper.findComponent(JInputFile);
      const file = createFile('doc.pdf', 1024, 'application/pdf');

      await selectFiles(baseInputFile, [file]);

      expect(baseInputFile.emitted('update:files')?.[0]).toEqual([[file]]);
    });
  });

  // ── 2.6 Error states ─────────────────────────────────────

  describe('error states', () => {
    it('displays manual error message from error prop', () => {
      const wrapper = mount(JInputFile, {
        props: { error: 'Something went wrong' },
      });
      expect(wrapper.text()).toContain('Something went wrong');
    });

    it('sets aria-invalid="true" on drop zone when error is present', () => {
      const wrapper = mount(JInputFile, {
        props: { error: 'Error' },
      });
      expect(wrapper.find('[role="button"]').attributes('aria-invalid')).toBe('true');
    });

    it('does not set aria-invalid when no error', () => {
      const wrapper = mount(JInputFile);
      expect(wrapper.find('[role="button"]').attributes('aria-invalid')).toBeUndefined();
    });

    it('manual error prop takes priority over vee-validate error', async () => {
      const schema = yup.object({
        document: yup.array().min(1, 'Field required'),
      });
      const wrapper = mountWithForm(
        JInputFile,
        schema,
        'document',
        {
          error: 'Manual error',
        },
        [],
      );
      const dropZone = wrapper.find('[role="button"]');

      // Trigger vee-validate error
      await dropZone.trigger('blur');
      await flushValidation();

      expect(wrapper.text()).toContain('Manual error');
      expect(wrapper.text()).not.toContain('Field required');
    });
  });

  // ── 2.7 Disabled state ───────────────────────────────────

  describe('disabled state', () => {
    it('sets aria-disabled="true" on the drop zone', () => {
      const wrapper = mount(JInputFile, { props: { disabled: true } });
      expect(wrapper.find('[role="button"]').attributes('aria-disabled')).toBe('true');
    });

    it('clicking drop zone does not trigger file selection when disabled', async () => {
      const wrapper = mount(JInputFile, { props: { disabled: true } });
      const input = wrapper.find('input[type="file"]');
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await wrapper.find('[role="button"]').trigger('click');

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('hidden input has the disabled attribute', () => {
      const wrapper = mount(JInputFile, { props: { disabled: true } });
      expect(wrapper.find('input[type="file"]').attributes('disabled')).toBeDefined();
    });

    it('drop zone has tabindex="-1" when disabled', () => {
      const wrapper = mount(JInputFile, { props: { disabled: true } });
      expect(wrapper.find('[role="button"]').attributes('tabindex')).toBe('-1');
    });
  });

  // ── 2.8 Label ─────────────────────────────────────────────

  describe('label', () => {
    it('renders label text when label prop is provided', () => {
      const wrapper = mount(JInputFile, { props: { label: 'Upload' } });
      expect(wrapper.find('label').text()).toBe('Upload');
    });

    it("label's for matches hidden input's id", () => {
      const wrapper = mount(JInputFile, { props: { label: 'Upload' } });
      const label = wrapper.find('label');
      const input = wrapper.find('input[type="file"]');
      expect(label.attributes('for')).toBe(input.attributes('id'));
      expect(label.attributes('for')).toBeTruthy();
    });

    it('does not render label when label prop is omitted', () => {
      const wrapper = mount(JInputFile);
      expect(wrapper.find('label').exists()).toBe(false);
    });
  });

  // ── 2.9 Accessibility ────────────────────────────────────

  describe('accessibility', () => {
    it('drop zone has role="button" and tabindex="0" when not disabled', () => {
      const wrapper = mount(JInputFile);
      const dropZone = wrapper.find('[role="button"]');
      expect(dropZone.exists()).toBe(true);
      expect(dropZone.attributes('tabindex')).toBe('0');
    });

    it('pressing Enter on drop zone triggers file picker', async () => {
      const wrapper = mount(JInputFile);
      const input = wrapper.find('input[type="file"]');
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await wrapper.find('[role="button"]').trigger('keydown.enter');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('pressing Space on drop zone triggers file picker', async () => {
      const wrapper = mount(JInputFile);
      const input = wrapper.find('input[type="file"]');
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await wrapper.find('[role="button"]').trigger('keydown.space');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('aria-describedby on drop zone points to error element id when error is present', () => {
      const wrapper = mount(JInputFile, {
        props: { error: 'Required' },
      });
      const dropZone = wrapper.find('[role="button"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(dropZone.attributes('aria-describedby')).toBe(errorEl.attributes('id'));
    });

    it('aria-describedby not set when no error', () => {
      const wrapper = mount(JInputFile);
      expect(wrapper.find('[role="button"]').attributes('aria-describedby')).toBeUndefined();
    });

    it('error message element has role="alert"', () => {
      const wrapper = mount(JInputFile, {
        props: { error: 'Error' },
      });
      const errorEl = wrapper.find('[role="alert"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe('Error');
    });

    it('uses custom id prop for input id when provided', () => {
      const wrapper = mount(JInputFile, {
        props: { id: 'custom-file-id' },
      });
      expect(wrapper.find('input[type="file"]').attributes('id')).toBe('custom-file-id');
    });

    it('generates unique IDs when id is not provided', () => {
      const Wrapper = defineComponent({
        components: { JInputFile },
        template: '<div><JInputFile /><JInputFile /></div>',
      });
      const wrapper = mount(Wrapper);
      const inputs = wrapper.findAll('input[type="file"]');
      const id1 = inputs[0].attributes('id');
      const id2 = inputs[1].attributes('id');
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('remove buttons have aria-label containing the file name', async () => {
      const wrapper = mount(JInputFile);
      const file = createFile('report.pdf', 1024, 'application/pdf');

      await selectFiles(wrapper, [file]);

      const removeButton = wrapper.find('button[aria-label]');
      expect(removeButton.attributes('aria-label')).toContain('report.pdf');
    });
  });

  // ── hint ─────────────────────────────────────────────────

  describe('hint', () => {
    it('renders hint text when hint prop is provided', () => {
      const wrapper = mount(JInputFile, {
        props: { hint: 'Max file size: 5MB' },
      });
      expect(wrapper.text()).toContain('Max file size: 5MB');
    });

    it('does not render hint element when hint is omitted', () => {
      const wrapper = mount(JInputFile);
      expect(wrapper.find('[id$="-hint"]').exists()).toBe(false);
    });

    it('sets aria-describedby to hint id when only hint is present', () => {
      const wrapper = mount(JInputFile, {
        props: { hint: 'Some hint' },
      });
      const dropZone = wrapper.find('[role="button"]');
      const hintEl = wrapper.find('[id$="-hint"]');
      expect(dropZone.attributes('aria-describedby')).toBe(hintEl.attributes('id'));
    });

    it('sets aria-describedby to both hint and error ids when both are present', () => {
      const wrapper = mount(JInputFile, {
        props: { hint: 'Some hint', error: 'Some error' },
      });
      const dropZone = wrapper.find('[role="button"]');
      const describedby = dropZone.attributes('aria-describedby')!;
      const hintEl = wrapper.find('[id$="-hint"]');
      const errorEl = wrapper.find('[role="alert"]');
      expect(describedby).toContain(hintEl.attributes('id'));
      expect(describedby).toContain(errorEl.attributes('id'));
    });

    it('hint remains visible when error is shown', () => {
      const wrapper = mount(JInputFile, {
        props: { hint: 'Helpful hint', error: 'Error message' },
      });
      expect(wrapper.text()).toContain('Helpful hint');
      expect(wrapper.text()).toContain('Error message');
    });
  });

  // ── required ────────────────────────────────────────────

  describe('required', () => {
    it('shows red asterisk in label when required and label are both set', () => {
      const wrapper = mount(JInputFile, {
        props: { label: 'Upload', required: true },
      });
      const label = wrapper.find('label');
      expect(label.text()).toContain('*');
      const asterisk = label.find('span');
      expect(asterisk.attributes('aria-hidden')).toBe('true');
    });

    it('no asterisk when required is false', () => {
      const wrapper = mount(JInputFile, {
        props: { label: 'Upload' },
      });
      expect(wrapper.find('label').text()).not.toContain('*');
    });

    it('shows inline asterisk when required is true and no label', () => {
      const wrapper = mount(JInputFile, {
        props: { required: true },
      });
      expect(wrapper.find('label').exists()).toBe(false);
      const asterisk = wrapper.find('span[aria-hidden="true"]');
      expect(asterisk.exists()).toBe(true);
      expect(asterisk.text()).toBe('*');
    });

    it('sets native required attribute on file input', () => {
      const wrapper = mount(JInputFile, {
        props: { required: true },
      });
      expect(wrapper.find('input[type="file"]').attributes('required')).toBeDefined();
    });

    it('does not set required when not required', () => {
      const wrapper = mount(JInputFile);
      expect(wrapper.find('input[type="file"]').attributes('required')).toBeUndefined();
    });
  });

  // ── 2.10 Attribute passthrough ────────────────────────────

  describe('attribute passthrough', () => {
    it('passes arbitrary HTML attributes to the hidden file input', () => {
      const wrapper = mount(JInputFile, {
        attrs: { 'data-testid': 'file-upload' },
      });
      const input = wrapper.find('input[type="file"]');
      expect(input.attributes('data-testid')).toBe('file-upload');
      // Wrapper div should not have the attribute
      expect(wrapper.attributes('data-testid')).toBeUndefined();
    });
  });
});
