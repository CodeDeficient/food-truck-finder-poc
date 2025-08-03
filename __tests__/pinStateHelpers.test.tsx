import '@testing-library/jest-dom';
import { pinStateHelpers } from '../components/map/TruckMarkers';

// Mock DOM element creation for testing
const createMockElement = () => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

describe('pinStateHelpers', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = createMockElement();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('toggleClass', () => {
    it('adds a class when it does not exist', () => {
      pinStateHelpers.toggleClass(mockElement, 'test-class');
      expect(mockElement).toHaveClass('test-class');
    });

    it('removes a class when it exists', () => {
      mockElement.classList.add('test-class');
      pinStateHelpers.toggleClass(mockElement, 'test-class');
      expect(mockElement).not.toHaveClass('test-class');
    });
  });

  describe('addClass', () => {
    it('adds a class to the element', () => {
      pinStateHelpers.addClass(mockElement, 'new-class');
      expect(mockElement).toHaveClass('new-class');
    });

    it('does not duplicate classes', () => {
      pinStateHelpers.addClass(mockElement, 'duplicate-class');
      pinStateHelpers.addClass(mockElement, 'duplicate-class');
      expect(mockElement.classList.length).toBe(1);
    });
  });

  describe('removeClass', () => {
    it('removes a class from the element', () => {
      mockElement.classList.add('remove-me');
      pinStateHelpers.removeClass(mockElement, 'remove-me');
      expect(mockElement).not.toHaveClass('remove-me');
    });

    it('does nothing if class does not exist', () => {
      const originalClasses = mockElement.className;
      pinStateHelpers.removeClass(mockElement, 'non-existent');
      expect(mockElement.className).toBe(originalClasses);
    });
  });

  describe('handleMouseOver', () => {
    it('sets the data-hovering attribute', () => {
      pinStateHelpers.handleMouseOver(mockElement);
      expect(mockElement.getAttribute('data-hovering')).toBe('true');
    });
  });

  describe('handleMouseOut', () => {
    it('removes the data-hovering attribute', () => {
      mockElement.setAttribute('data-hovering', 'true');
      pinStateHelpers.handleMouseOut(mockElement);
      expect(mockElement.getAttribute('data-hovering')).toBeNull();
    });
  });

  describe('handleFocus', () => {
    it('sets the data-focused attribute', () => {
      pinStateHelpers.handleFocus(mockElement);
      expect(mockElement.getAttribute('data-focused')).toBe('true');
    });
  });

  describe('handleBlur', () => {
    it('removes the data-focused attribute', () => {
      mockElement.setAttribute('data-focused', 'true');
      pinStateHelpers.handleBlur(mockElement);
      expect(mockElement.getAttribute('data-focused')).toBeNull();
    });
  });

  describe('handleClick', () => {
    it('adds pin--selected class when isSelected is true', () => {
      pinStateHelpers.handleClick(mockElement, true);
      expect(mockElement).toHaveClass('pin--selected');
    });

    it('removes pin--selected class when isSelected is false', () => {
      mockElement.classList.add('pin--selected');
      pinStateHelpers.handleClick(mockElement, false);
      expect(mockElement).not.toHaveClass('pin--selected');
    });
  });
});
