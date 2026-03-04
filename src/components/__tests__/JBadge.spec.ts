import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import JBadge from '../JBadge.vue';

describe('JBadge', () => {
  // ── Rendering ───────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <span> element', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.element.tagName).toBe('SPAN');
    });

    it('renders slot content', () => {
      const wrapper = mount(JBadge, {
        slots: { default: 'Active' },
      });
      expect(wrapper.text()).toContain('Active');
    });

    it('renders label prop as fallback', () => {
      const wrapper = mount(JBadge, {
        props: { label: 'Status' },
      });
      expect(wrapper.text()).toContain('Status');
    });

    it('slot takes priority over label prop', () => {
      const wrapper = mount(JBadge, {
        props: { label: 'Label Text' },
        slots: { default: 'Slot Text' },
      });
      expect(wrapper.text()).toContain('Slot Text');
      expect(wrapper.text()).not.toContain('Label Text');
    });

    it('applies base classes', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.classes()).toContain('inline-flex');
      expect(wrapper.classes()).toContain('items-center');
      expect(wrapper.classes()).toContain('font-medium');
    });
  });

  // ── Variants ────────────────────────────────────────────

  describe('variants', () => {
    it('applies default variant classes by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.classes()).toContain('bg-badge-default-bg');
      expect(wrapper.classes()).toContain('text-badge-default-text');
    });

    it('applies primary variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'primary' },
      });
      expect(wrapper.classes()).toContain('bg-badge-primary-bg');
      expect(wrapper.classes()).toContain('text-badge-primary-text');
    });

    it('applies success variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'success' },
      });
      expect(wrapper.classes()).toContain('bg-badge-success-bg');
      expect(wrapper.classes()).toContain('text-badge-success-text');
    });

    it('applies warning variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'warning' },
      });
      expect(wrapper.classes()).toContain('bg-badge-warning-bg');
      expect(wrapper.classes()).toContain('text-badge-warning-text');
    });

    it('applies danger variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'danger' },
      });
      expect(wrapper.classes()).toContain('bg-badge-danger-bg');
      expect(wrapper.classes()).toContain('text-badge-danger-text');
    });

    it('applies info variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'info' },
      });
      expect(wrapper.classes()).toContain('bg-badge-info-bg');
      expect(wrapper.classes()).toContain('text-badge-info-text');
    });

    it('applies outline variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'outline' },
      });
      expect(wrapper.classes()).toContain('border');
      expect(wrapper.classes()).toContain('border-badge-outline-border');
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('text-badge-outline-text');
    });

    it('applies secondary variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'secondary' },
      });
      expect(wrapper.classes()).toContain('bg-badge-secondary-bg');
      expect(wrapper.classes()).toContain('text-badge-secondary-text');
    });

    it('applies ghost variant classes', () => {
      const wrapper = mount(JBadge, {
        props: { variant: 'ghost' },
      });
      expect(wrapper.classes()).toContain('bg-transparent');
      expect(wrapper.classes()).toContain('text-badge-ghost-text');
    });
  });

  // ── Sizes ───────────────────────────────────────────────

  describe('sizes', () => {
    it('applies sm size classes', () => {
      const wrapper = mount(JBadge, {
        props: { size: 'sm' },
      });
      expect(wrapper.classes()).toContain('px-1.5');
      expect(wrapper.classes()).toContain('py-0.5');
      expect(wrapper.classes()).toContain('text-xs');
      expect(wrapper.classes()).toContain('gap-1');
    });

    it('applies md size classes by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.classes()).toContain('px-2.5');
      expect(wrapper.classes()).toContain('py-0.5');
      expect(wrapper.classes()).toContain('text-xs');
      expect(wrapper.classes()).toContain('gap-1.5');
    });

    it('applies lg size classes', () => {
      const wrapper = mount(JBadge, {
        props: { size: 'lg' },
      });
      expect(wrapper.classes()).toContain('px-3');
      expect(wrapper.classes()).toContain('py-1');
      expect(wrapper.classes()).toContain('text-sm');
      expect(wrapper.classes()).toContain('gap-1.5');
    });
  });

  // ── Pill shape ──────────────────────────────────────────

  describe('pill shape', () => {
    it('applies rounded-md by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.classes()).toContain('rounded-md');
    });

    it('applies rounded-full when pill is true', () => {
      const wrapper = mount(JBadge, {
        props: { pill: true },
      });
      expect(wrapper.classes()).toContain('rounded-full');
      expect(wrapper.classes()).not.toContain('rounded-md');
    });
  });

  // ── Dot indicator ───────────────────────────────────────

  describe('dot indicator', () => {
    it('does not render dot by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.find('[data-testid="badge-dot"]').exists()).toBe(false);
    });

    it('renders dot when dot prop is true', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true },
      });
      expect(wrapper.find('[data-testid="badge-dot"]').exists()).toBe(true);
    });

    it('dot is placed before content', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true, label: 'Status' },
      });
      const html = wrapper.html();
      const dotPos = html.indexOf('badge-dot');
      const labelPos = html.indexOf('Status');
      expect(dotPos).toBeLessThan(labelPos);
    });

    it('dot has aria-hidden', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true },
      });
      const dot = wrapper.find('[data-testid="badge-dot"]');
      expect(dot.attributes('aria-hidden')).toBe('true');
    });

    it('dot applies default variant color', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true },
      });
      const dot = wrapper.find('[data-testid="badge-dot"]');
      expect(dot.classes()).toContain('bg-badge-default-dot');
    });

    it('dot applies variant-specific color', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true, variant: 'success' },
      });
      const dot = wrapper.find('[data-testid="badge-dot"]');
      expect(dot.classes()).toContain('bg-badge-success-dot');
    });
  });

  // ── Removable ───────────────────────────────────────────

  describe('removable', () => {
    it('does not render remove button by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('renders remove button when removable is true', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true },
      });
      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('remove button has default aria-label', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true },
      });
      expect(wrapper.find('button').attributes('aria-label')).toBe('Remove');
    });

    it('remove button has custom aria-label', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true, removeLabel: 'Delete tag' },
      });
      expect(wrapper.find('button').attributes('aria-label')).toBe('Delete tag');
    });

    it('emits remove event on click', async () => {
      const wrapper = mount(JBadge, {
        props: { removable: true },
      });
      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('remove')).toHaveLength(1);
    });

    it('remove button contains xmark icon SVG', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true },
      });
      expect(wrapper.find('button svg').exists()).toBe(true);
    });

    it('remove button is placed after content', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true, label: 'Tag' },
      });
      const html = wrapper.html();
      const labelPos = html.indexOf('Tag');
      const buttonPos = html.indexOf('<button');
      expect(buttonPos).toBeGreaterThan(labelPos);
    });
  });

  // ── Slots ───────────────────────────────────────────────

  describe('slots', () => {
    it('icon-left renders before content', () => {
      const wrapper = mount(JBadge, {
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
      const wrapper = mount(JBadge, {
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
      const wrapper = mount(JBadge, {
        slots: {
          'icon-left': '<svg data-testid="left" />',
          default: 'Label',
          'icon-right': '<svg data-testid="right" />',
        },
      });
      expect(wrapper.find('[data-testid="left"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="right"]').exists()).toBe(true);
    });

    it('dot renders before icon-left', () => {
      const wrapper = mount(JBadge, {
        props: { dot: true },
        slots: {
          'icon-left': '<svg data-testid="left-icon" />',
          default: 'Label',
        },
      });
      const html = wrapper.html();
      const dotPos = html.indexOf('badge-dot');
      const leftIconPos = html.indexOf('left-icon');
      expect(dotPos).toBeLessThan(leftIconPos);
    });
  });

  // ── Accessibility ───────────────────────────────────────

  describe('accessibility', () => {
    it('has no role by default', () => {
      const wrapper = mount(JBadge);
      expect(wrapper.attributes('role')).toBeUndefined();
    });

    it('forwards role prop', () => {
      const wrapper = mount(JBadge, {
        props: { role: 'status' },
      });
      expect(wrapper.attributes('role')).toBe('status');
    });

    it('remove button has type="button"', () => {
      const wrapper = mount(JBadge, {
        props: { removable: true },
      });
      expect(wrapper.find('button').attributes('type')).toBe('button');
    });
  });

  // ── Attribute passthrough ───────────────────────────────

  describe('attribute passthrough', () => {
    it('forwards data-testid to root element', () => {
      const wrapper = mount(JBadge, {
        attrs: { 'data-testid': 'my-badge' },
      });
      expect(wrapper.attributes('data-testid')).toBe('my-badge');
    });

    it('forwards custom class to root element', () => {
      const wrapper = mount(JBadge, {
        attrs: { class: 'extra-class' },
      });
      expect(wrapper.classes()).toContain('extra-class');
    });

    it('forwards style to root element', () => {
      const wrapper = mount(JBadge, {
        attrs: { style: 'color: red' },
      });
      expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('forwards aria-label to root element', () => {
      const wrapper = mount(JBadge, {
        attrs: { 'aria-label': 'New items' },
      });
      expect(wrapper.attributes('aria-label')).toBe('New items');
    });
  });
});
