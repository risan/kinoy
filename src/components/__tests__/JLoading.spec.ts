import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import JLoading from '../JLoading.vue';

describe('JLoading', () => {
  // ── Rendering ───────────────────────────────────────────

  describe('rendering', () => {
    it('renders an SVG with animate-spin', () => {
      const wrapper = mount(JLoading);
      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      expect(svg.classes()).toContain('animate-spin');
    });

    it('renders as a <span> by default', () => {
      const wrapper = mount(JLoading);
      expect(wrapper.element.tagName).toBe('SPAN');
    });
  });

  // ── Size prop ─────────────────────────────────────────────

  describe('size prop', () => {
    it('defaults to md (h-6 w-6)', () => {
      const wrapper = mount(JLoading);
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-6');
      expect(svg.classes()).toContain('w-6');
    });

    it('applies xs size (h-3 w-3)', () => {
      const wrapper = mount(JLoading, { props: { size: 'xs' } });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-3');
      expect(svg.classes()).toContain('w-3');
    });

    it('applies sm size (h-4 w-4)', () => {
      const wrapper = mount(JLoading, { props: { size: 'sm' } });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-4');
      expect(svg.classes()).toContain('w-4');
    });

    it('applies lg size (h-8 w-8)', () => {
      const wrapper = mount(JLoading, { props: { size: 'lg' } });
      const svg = wrapper.find('svg');
      expect(svg.classes()).toContain('h-8');
      expect(svg.classes()).toContain('w-8');
    });
  });

  // ── Color prop ────────────────────────────────────────────

  describe('color prop', () => {
    it('defaults to text-current', () => {
      const wrapper = mount(JLoading);
      expect(wrapper.classes()).toContain('text-current');
    });

    it('applies text-primary for primary color', () => {
      const wrapper = mount(JLoading, { props: { color: 'primary' } });
      expect(wrapper.classes()).toContain('text-primary');
    });

    it('applies text-input-placeholder for muted color', () => {
      const wrapper = mount(JLoading, { props: { color: 'muted' } });
      expect(wrapper.classes()).toContain('text-input-placeholder');
    });
  });

  // ── Accessibility ─────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="status"', () => {
      const wrapper = mount(JLoading);
      expect(wrapper.attributes('role')).toBe('status');
    });

    it('has aria-live="polite"', () => {
      const wrapper = mount(JLoading);
      expect(wrapper.attributes('aria-live')).toBe('polite');
    });

    it('has default aria-label "Loading..."', () => {
      const wrapper = mount(JLoading);
      expect(wrapper.attributes('aria-label')).toBe('Loading...');
    });

    it('uses custom label prop for aria-label', () => {
      const wrapper = mount(JLoading, { props: { label: 'Loading options' } });
      expect(wrapper.attributes('aria-label')).toBe('Loading options');
    });

    it('renders sr-only text', () => {
      const wrapper = mount(JLoading);
      const srOnly = wrapper.find('.sr-only');
      expect(srOnly.exists()).toBe(true);
      expect(srOnly.text()).toBe('Loading...');
    });

    it('sr-only text matches label prop', () => {
      const wrapper = mount(JLoading, { props: { label: 'Please wait' } });
      expect(wrapper.find('.sr-only').text()).toBe('Please wait');
    });
  });

  // ── Overlay mode ──────────────────────────────────────────

  describe('overlay mode', () => {
    it('renders as a <div> with overlay classes', () => {
      const wrapper = mount(JLoading, { props: { overlay: true } });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.classes()).toContain('absolute');
      expect(wrapper.classes()).toContain('inset-0');
    });

    it('has role="status"', () => {
      const wrapper = mount(JLoading, { props: { overlay: true } });
      expect(wrapper.attributes('role')).toBe('status');
    });

    it('contains spinning SVG', () => {
      const wrapper = mount(JLoading, { props: { overlay: true } });
      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
      expect(svg.classes()).toContain('animate-spin');
    });
  });

  // ── Attribute passthrough ─────────────────────────────────

  describe('attribute passthrough', () => {
    it('forwards data-testid to wrapper element', () => {
      const wrapper = mount(JLoading, {
        attrs: { 'data-testid': 'my-loading' },
      });
      expect(wrapper.attributes('data-testid')).toBe('my-loading');
    });

    it('forwards custom class to wrapper element', () => {
      const wrapper = mount(JLoading, {
        attrs: { class: 'extra-class' },
      });
      expect(wrapper.classes()).toContain('extra-class');
    });

    it('forwards attrs in overlay mode', () => {
      const wrapper = mount(JLoading, {
        props: { overlay: true },
        attrs: { 'data-testid': 'overlay-loading' },
      });
      expect(wrapper.attributes('data-testid')).toBe('overlay-loading');
    });
  });
});
