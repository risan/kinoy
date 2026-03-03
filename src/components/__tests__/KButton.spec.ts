import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import KButton from '../KButton.vue';
import KLoading from '../KLoading.vue';

describe('KButton', () => {
  // ── Rendering ───────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <button> by default', () => {
      const wrapper = mount(KButton);
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('renders slot content', () => {
      const wrapper = mount(KButton, {
        slots: { default: 'Click me' },
      });
      expect(wrapper.text()).toContain('Click me');
    });

    it('renders label prop as fallback', () => {
      const wrapper = mount(KButton, {
        props: { label: 'Submit' },
      });
      expect(wrapper.text()).toContain('Submit');
    });

    it('slot takes priority over label prop', () => {
      const wrapper = mount(KButton, {
        props: { label: 'Label Text' },
        slots: { default: 'Slot Text' },
      });
      expect(wrapper.text()).toContain('Slot Text');
      expect(wrapper.text()).not.toContain('Label Text');
    });
  });

  // ── Type attribute ──────────────────────────────────────

  describe('type attribute', () => {
    it('defaults to type="button"', () => {
      const wrapper = mount(KButton);
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('supports type="submit"', () => {
      const wrapper = mount(KButton, {
        props: { type: 'submit' },
      });
      expect(wrapper.attributes('type')).toBe('submit');
    });

    it('supports type="reset"', () => {
      const wrapper = mount(KButton, {
        props: { type: 'reset' },
      });
      expect(wrapper.attributes('type')).toBe('reset');
    });

    it('omits type on <a> tag', () => {
      const wrapper = mount(KButton, {
        props: { href: '/page', type: 'submit' },
      });
      expect(wrapper.attributes('type')).toBeUndefined();
    });
  });

  // ── Polymorphic ─────────────────────────────────────────

  describe('polymorphic', () => {
    it('renders <a> when href is set', () => {
      const wrapper = mount(KButton, {
        props: { href: 'https://example.com' },
      });
      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('href')).toBe('https://example.com');
    });

    it('adds role="button" on <a>', () => {
      const wrapper = mount(KButton, {
        props: { href: '/page' },
      });
      expect(wrapper.attributes('role')).toBe('button');
    });

    it('does not add role on <button>', () => {
      const wrapper = mount(KButton);
      expect(wrapper.attributes('role')).toBeUndefined();
    });

    it('does not set native disabled on <a>', () => {
      const wrapper = mount(KButton, {
        props: { href: '/page', disabled: true },
      });
      expect(wrapper.attributes('disabled')).toBeUndefined();
    });

    it('sets tabindex="-1" on disabled <a>', () => {
      const wrapper = mount(KButton, {
        props: { href: '/page', disabled: true },
      });
      expect(wrapper.attributes('tabindex')).toBe('-1');
    });
  });

  // ── Variants ────────────────────────────────────────────

  describe('variants', () => {
    it('applies primary variant classes by default', () => {
      const wrapper = mount(KButton);
      expect(wrapper.classes()).toContain('bg-btn-primary-bg');
      expect(wrapper.classes()).toContain('text-btn-primary-text');
    });

    it('applies secondary variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'secondary' },
      });
      expect(wrapper.classes()).toContain('bg-btn-secondary-bg');
      expect(wrapper.classes()).toContain('text-btn-secondary-text');
    });

    it('applies outline variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'outline' },
      });
      expect(wrapper.classes()).toContain('border');
      expect(wrapper.classes()).toContain('border-btn-outline-border');
      expect(wrapper.classes()).toContain('text-btn-outline-text');
    });

    it('applies ghost variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'ghost' },
      });
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('text-btn-ghost-text');
    });

    it('applies danger variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'danger' },
      });
      expect(wrapper.classes()).toContain('bg-btn-danger-bg');
      expect(wrapper.classes()).toContain('text-btn-danger-text');
    });

    it('applies default variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'default' },
      });
      expect(wrapper.classes()).toContain('bg-btn-default-bg');
      expect(wrapper.classes()).toContain('text-btn-default-text');
    });

    it('applies success variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'success' },
      });
      expect(wrapper.classes()).toContain('bg-btn-success-bg');
      expect(wrapper.classes()).toContain('text-btn-success-text');
    });

    it('applies warning variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'warning' },
      });
      expect(wrapper.classes()).toContain('bg-btn-warning-bg');
      expect(wrapper.classes()).toContain('text-btn-warning-text');
    });

    it('applies info variant classes', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'info' },
      });
      expect(wrapper.classes()).toContain('bg-btn-info-bg');
      expect(wrapper.classes()).toContain('text-btn-info-text');
    });
  });

  // ── Sizes ───────────────────────────────────────────────

  describe('sizes', () => {
    it('applies sm size classes', () => {
      const wrapper = mount(KButton, {
        props: { size: 'sm' },
      });
      expect(wrapper.classes()).toContain('px-3');
      expect(wrapper.classes()).toContain('py-1.5');
      expect(wrapper.classes()).toContain('text-xs');
    });

    it('applies md size classes by default', () => {
      const wrapper = mount(KButton);
      expect(wrapper.classes()).toContain('px-4');
      expect(wrapper.classes()).toContain('py-2');
      expect(wrapper.classes()).toContain('text-sm');
    });

    it('applies lg size classes', () => {
      const wrapper = mount(KButton, {
        props: { size: 'lg' },
      });
      expect(wrapper.classes()).toContain('px-5');
      expect(wrapper.classes()).toContain('py-2.5');
      expect(wrapper.classes()).toContain('text-base');
    });
  });

  // ── Disabled state ──────────────────────────────────────

  describe('disabled state', () => {
    it('sets native disabled attribute', () => {
      const wrapper = mount(KButton, {
        props: { disabled: true },
      });
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('sets aria-disabled', () => {
      const wrapper = mount(KButton, {
        props: { disabled: true },
      });
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('applies disabled styling', () => {
      const wrapper = mount(KButton, {
        props: { disabled: true },
      });
      expect(wrapper.classes()).toContain('bg-btn-disabled-bg');
      expect(wrapper.classes()).toContain('text-btn-disabled-text');
      expect(wrapper.classes()).toContain('cursor-not-allowed');
    });

    it('outline disabled keeps transparent bg with border', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'outline', disabled: true },
      });
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('border-btn-disabled-border');
      expect(wrapper.classes()).toContain('text-btn-disabled-text');
    });

    it('ghost disabled keeps transparent bg', () => {
      const wrapper = mount(KButton, {
        props: { variant: 'ghost', disabled: true },
      });
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('text-btn-disabled-text');
    });
  });

  // ── Loading state ───────────────────────────────────────

  describe('loading state', () => {
    it('shows KLoading spinner', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
        slots: { default: 'Save' },
      });
      expect(wrapper.findComponent(KLoading).exists()).toBe(true);
    });

    it('sets aria-busy', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
      });
      expect(wrapper.attributes('aria-busy')).toBe('true');
    });

    it('sets aria-disabled', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
      });
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('sets native disabled', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
      });
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('keeps slot content visible during loading', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
        slots: { default: 'Saving...' },
      });
      expect(wrapper.text()).toContain('Saving...');
    });

    it('hides icon-left slot during loading', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
        slots: {
          'icon-left': '<svg data-testid="icon">icon</svg>',
          default: 'Save',
        },
      });
      expect(wrapper.find('[data-testid="icon"]').exists()).toBe(false);
    });

    it('maps sm button to xs spinner', () => {
      const wrapper = mount(KButton, {
        props: { loading: true, size: 'sm' },
      });
      const loading = wrapper.findComponent(KLoading);
      expect(loading.props('size')).toBe('xs');
    });

    it('maps md button to sm spinner', () => {
      const wrapper = mount(KButton, {
        props: { loading: true, size: 'md' },
      });
      const loading = wrapper.findComponent(KLoading);
      expect(loading.props('size')).toBe('sm');
    });

    it('maps lg button to md spinner', () => {
      const wrapper = mount(KButton, {
        props: { loading: true, size: 'lg' },
      });
      const loading = wrapper.findComponent(KLoading);
      expect(loading.props('size')).toBe('md');
    });

    it('passes loadingLabel to KLoading', () => {
      const wrapper = mount(KButton, {
        props: { loading: true, loadingLabel: 'Submitting form...' },
      });
      const loading = wrapper.findComponent(KLoading);
      expect(loading.props('label')).toBe('Submitting form...');
    });

    it('passes color="current" to KLoading', () => {
      const wrapper = mount(KButton, {
        props: { loading: true },
      });
      const loading = wrapper.findComponent(KLoading);
      expect(loading.props('color')).toBe('current');
    });
  });

  // ── Slots ───────────────────────────────────────────────

  describe('slots', () => {
    it('icon-left renders before content', () => {
      const wrapper = mount(KButton, {
        slots: {
          'icon-left': '<svg data-testid="left-icon" />',
          default: 'Label',
        },
      });
      const html = wrapper.html();
      const leftIconPos = html.indexOf('left-icon');
      const labelPos = html.indexOf('Label');
      expect(leftIconPos).toBeLessThan(labelPos);
    });

    it('icon-right renders after content', () => {
      const wrapper = mount(KButton, {
        slots: {
          default: 'Label',
          'icon-right': '<svg data-testid="right-icon" />',
        },
      });
      const html = wrapper.html();
      const labelPos = html.indexOf('Label');
      const rightIconPos = html.indexOf('right-icon');
      expect(rightIconPos).toBeGreaterThan(labelPos);
    });

    it('both icon slots can render simultaneously', () => {
      const wrapper = mount(KButton, {
        slots: {
          'icon-left': '<svg data-testid="left" />',
          default: 'Label',
          'icon-right': '<svg data-testid="right" />',
        },
      });
      expect(wrapper.find('[data-testid="left"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="right"]').exists()).toBe(true);
    });
  });

  // ── Accessibility ───────────────────────────────────────

  describe('accessibility', () => {
    it('aria-busy is only present during loading', () => {
      const wrapper = mount(KButton);
      expect(wrapper.attributes('aria-busy')).toBeUndefined();
    });

    it('disabled <a> prevents click', async () => {
      const onClick = vi.fn();
      const wrapper = mount(KButton, {
        props: { href: '/page', disabled: true },
        attrs: { onClick },
      });
      await wrapper.trigger('click');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('forwards click events when interactive', async () => {
      const onClick = vi.fn();
      const wrapper = mount(KButton, {
        attrs: { onClick },
      });
      await wrapper.trigger('click');
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('loading <a> prevents click', async () => {
      const onClick = vi.fn();
      const wrapper = mount(KButton, {
        props: { href: '/page', loading: true },
        attrs: { onClick },
      });
      await wrapper.trigger('click');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('loading <button> prevents click', async () => {
      const onClick = vi.fn();
      const wrapper = mount(KButton, {
        props: { loading: true },
        attrs: { onClick },
      });
      await wrapper.trigger('click');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not set tabindex on <button>', () => {
      const wrapper = mount(KButton);
      expect(wrapper.attributes('tabindex')).toBeUndefined();
    });
  });

  // ── Attribute passthrough ───────────────────────────────

  describe('attribute passthrough', () => {
    it('forwards data-testid to root element', () => {
      const wrapper = mount(KButton, {
        attrs: { 'data-testid': 'my-button' },
      });
      expect(wrapper.attributes('data-testid')).toBe('my-button');
    });

    it('forwards custom class to root element', () => {
      const wrapper = mount(KButton, {
        attrs: { class: 'extra-class' },
      });
      expect(wrapper.classes()).toContain('extra-class');
    });

    it('forwards style to root element', () => {
      const wrapper = mount(KButton, {
        attrs: { style: 'color: red' },
      });
      expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('forwards aria-label to root element', () => {
      const wrapper = mount(KButton, {
        attrs: { 'aria-label': 'Close dialog' },
      });
      expect(wrapper.attributes('aria-label')).toBe('Close dialog');
    });
  });
});
