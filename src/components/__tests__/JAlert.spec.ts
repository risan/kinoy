import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import JAlert from '../JAlert.vue';
import IconCircleInfo from '../../icons/IconCircleInfo.vue';
import IconCircleCheck from '../../icons/IconCircleCheck.vue';
import IconTriangleExclamation from '../../icons/IconTriangleExclamation.vue';
import IconCircleXMark from '../../icons/IconCircleXMark.vue';

describe('JAlert', () => {
  // ── Rendering ───────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <div> element', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('renders title prop', () => {
      const wrapper = mount(JAlert, {
        props: { title: 'Heads up!' },
      });
      expect(wrapper.text()).toContain('Heads up!');
    });

    it('renders description prop', () => {
      const wrapper = mount(JAlert, {
        props: { description: 'Something happened.' },
      });
      expect(wrapper.text()).toContain('Something happened.');
    });

    it('renders default slot content', () => {
      const wrapper = mount(JAlert, {
        slots: { default: 'Custom content' },
      });
      expect(wrapper.text()).toContain('Custom content');
    });

    it('default slot overrides title and description props', () => {
      const wrapper = mount(JAlert, {
        props: { title: 'Title', description: 'Description' },
        slots: { default: 'Slot content' },
      });
      expect(wrapper.text()).toContain('Slot content');
      expect(wrapper.text()).not.toContain('Title');
      expect(wrapper.text()).not.toContain('Description');
    });

    it('applies base classes', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.classes()).toContain('flex');
      expect(wrapper.classes()).toContain('items-start');
      expect(wrapper.classes()).toContain('rounded-lg');
      expect(wrapper.classes()).toContain('border');
      expect(wrapper.classes()).toContain('px-3');
      expect(wrapper.classes()).toContain('py-2.5');
      expect(wrapper.classes()).toContain('gap-2');
    });
  });

  // ── Variants ────────────────────────────────────────────

  describe('variants', () => {
    it('applies default variant classes by default', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.classes()).toContain('bg-alert-default-bg');
      expect(wrapper.classes()).toContain('text-alert-default-text');
      expect(wrapper.classes()).toContain('border-alert-default-border');
    });

    it('applies success variant classes', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'success' },
      });
      expect(wrapper.classes()).toContain('bg-alert-success-bg');
      expect(wrapper.classes()).toContain('text-alert-success-text');
      expect(wrapper.classes()).toContain('border-alert-success-border');
    });

    it('applies warning variant classes', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'warning' },
      });
      expect(wrapper.classes()).toContain('bg-alert-warning-bg');
      expect(wrapper.classes()).toContain('text-alert-warning-text');
      expect(wrapper.classes()).toContain('border-alert-warning-border');
    });

    it('applies danger variant classes', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'danger' },
      });
      expect(wrapper.classes()).toContain('bg-alert-danger-bg');
      expect(wrapper.classes()).toContain('text-alert-danger-text');
      expect(wrapper.classes()).toContain('border-alert-danger-border');
    });

    it('applies info variant classes', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'info' },
      });
      expect(wrapper.classes()).toContain('bg-alert-info-bg');
      expect(wrapper.classes()).toContain('text-alert-info-text');
      expect(wrapper.classes()).toContain('border-alert-info-border');
    });
  });

  // ── Icons ─────────────────────────────────────────────

  describe('icons', () => {
    it('renders default icon SVG for default variant', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.findComponent(IconCircleInfo).exists()).toBe(true);
    });

    it('renders default icon for success variant', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'success' },
      });
      expect(wrapper.findComponent(IconCircleCheck).exists()).toBe(true);
    });

    it('renders default icon for warning variant', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'warning' },
      });
      expect(wrapper.findComponent(IconTriangleExclamation).exists()).toBe(true);
    });

    it('renders default icon for danger variant', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'danger' },
      });
      expect(wrapper.findComponent(IconCircleXMark).exists()).toBe(true);
    });

    it('renders default icon for info variant', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'info' },
      });
      expect(wrapper.findComponent(IconCircleInfo).exists()).toBe(true);
    });

    it('icon slot overrides default icon', () => {
      const wrapper = mount(JAlert, {
        slots: { icon: '<svg data-testid="custom-icon" />' },
      });
      expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
      expect(wrapper.findComponent(IconCircleInfo).exists()).toBe(false);
    });

    it('icon container has aria-hidden', () => {
      const wrapper = mount(JAlert);
      const iconContainer = wrapper.find('[data-testid="alert-icon"]');
      expect(iconContainer.attributes('aria-hidden')).toBe('true');
    });

    it('icon applies variant-specific color class', () => {
      const wrapper = mount(JAlert, {
        props: { variant: 'success' },
      });
      const iconContainer = wrapper.find('[data-testid="alert-icon"]');
      expect(iconContainer.classes()).toContain('text-alert-success-icon');
    });
  });

  // ── Slots ─────────────────────────────────────────────

  describe('slots', () => {
    it('title slot overrides title prop', () => {
      const wrapper = mount(JAlert, {
        props: { title: 'Prop title' },
        slots: { title: 'Slot title' },
      });
      expect(wrapper.text()).toContain('Slot title');
      expect(wrapper.text()).not.toContain('Prop title');
    });

    it('description slot overrides description prop', () => {
      const wrapper = mount(JAlert, {
        props: { description: 'Prop desc' },
        slots: { description: 'Slot desc' },
      });
      expect(wrapper.text()).toContain('Slot desc');
      expect(wrapper.text()).not.toContain('Prop desc');
    });

    it('icon is rendered before content', () => {
      const wrapper = mount(JAlert, {
        props: { title: 'Title' },
      });
      const html = wrapper.html();
      const iconPos = html.indexOf('alert-icon');
      const titlePos = html.indexOf('Title');
      expect(iconPos).toBeLessThan(titlePos);
    });

    it('title is rendered before description', () => {
      const wrapper = mount(JAlert, {
        props: { title: 'Title', description: 'Description' },
      });
      const html = wrapper.html();
      const titlePos = html.indexOf('Title');
      const descPos = html.indexOf('Description');
      expect(titlePos).toBeLessThan(descPos);
    });
  });

  // ── Dismissible ───────────────────────────────────────

  describe('dismissible', () => {
    it('does not render close button by default', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('renders close button when dismissible is true', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find('button').exists()).toBe(true);
    });

    it('close button has default aria-label', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find('button').attributes('aria-label')).toBe('Close');
    });

    it('close button has custom aria-label', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true, closeLabel: 'Dismiss alert' },
      });
      expect(wrapper.find('button').attributes('aria-label')).toBe('Dismiss alert');
    });

    it('emits close event on click', async () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      await wrapper.find('button').trigger('click');
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('hides alert after close button click', async () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      await wrapper.find('button').trigger('click');
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('close button has type="button"', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find('button').attributes('type')).toBe('button');
    });

    it('close button contains xmark icon SVG', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find('button svg').exists()).toBe(true);
    });
  });

  // ── Accessibility ─────────────────────────────────────

  describe('accessibility', () => {
    it('has role="alert" on root', () => {
      const wrapper = mount(JAlert);
      expect(wrapper.attributes('role')).toBe('alert');
    });

    it('close button does not have tabindex="-1"', () => {
      const wrapper = mount(JAlert, {
        props: { dismissible: true },
      });
      expect(wrapper.find('button').attributes('tabindex')).toBeUndefined();
    });
  });

  // ── Attribute passthrough ─────────────────────────────

  describe('attribute passthrough', () => {
    it('forwards data-testid to root element', () => {
      const wrapper = mount(JAlert, {
        attrs: { 'data-testid': 'my-alert' },
      });
      expect(wrapper.attributes('data-testid')).toBe('my-alert');
    });

    it('forwards custom class to root element', () => {
      const wrapper = mount(JAlert, {
        attrs: { class: 'extra-class' },
      });
      expect(wrapper.classes()).toContain('extra-class');
    });

    it('forwards style to root element', () => {
      const wrapper = mount(JAlert, {
        attrs: { style: 'color: red' },
      });
      expect(wrapper.attributes('style')).toContain('color: red');
    });
  });
});
