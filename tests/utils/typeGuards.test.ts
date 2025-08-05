import { jest } from '@jest/globals';
import { isValidObject, hasProperty, isStringArray, assertType, safeAssign } from '../../lib/utils/typeGuards';

describe('isValidObject', () => {
  it('should return true for a valid object', () => {
    expect(isValidObject({})).toBe(true);
    expect(isValidObject({ a: 1 })).toBe(true);
  });

  it('should return false for null or non-object values', () => {
    expect(isValidObject(null)).toBe(false);
    expect(isValidObject(undefined)).toBe(false);
    expect(isValidObject('string')).toBe(false);
    expect(isValidObject(123)).toBe(false);
    expect(isValidObject([])).toBe(true); // Arrays are objects in JS
  });
});

describe('hasProperty', () => {
  it('should return true if the object has the property', () => {
    const obj = { a: 1, b: 'test' };
    expect(hasProperty(obj, 'a')).toBe(true);
    expect(hasProperty(obj, 'b')).toBe(true);
  });

  it('should return false if the object does not have the property', () => {
    const obj = { a: 1 };
    expect(hasProperty(obj, 'b')).toBe(false);
  });

  it('should return false for inherited properties', () => {
    const proto = { a: 1 };
    const obj = Object.create(proto);
    expect(hasProperty(obj, 'a')).toBe(false);
  });
});

describe('isStringArray', () => {
  it('should return true for an array of strings', () => {
    expect(isStringArray([])).toBe(true);
    expect(isStringArray(['a', 'b'])).toBe(true);
  });

  it('should return false for non-array or mixed-type arrays', () => {
    expect(isStringArray(null)).toBe(false);
    expect(isStringArray(undefined)).toBe(false);
    expect(isStringArray('string')).toBe(false);
    expect(isStringArray(123)).toBe(false);
    expect(isStringArray([1, 2])).toBe(false);
    expect(isStringArray(['a', 1])).toBe(false);
  });
});

describe('assertType', () => {
  it('should not throw if validation passes', () => {
    const isNumber = (val: unknown): val is number => typeof val === 'number';
    expect(() => assertType(5, isNumber)).not.toThrow();
  });

  it('should throw TypeError if validation fails', () => {
    const isNumber = (val: unknown): val is number => typeof val === 'number';
    expect(() => assertType('hello', isNumber)).toThrow(TypeError);
    expect(() => assertType('hello', isNumber, 'Expected a number')).toThrow('Expected a number');
  });
});

describe('safeAssign', () => {
  const isNumber = (val: unknown): val is number => typeof val === 'number';

  it('should return the value if validation passes', () => {
    expect(safeAssign(10, 0, isNumber)).toBe(10);
  });

  it('should return the fallback if validation fails', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(safeAssign('not a number', 0, isNumber)).toBe(0);
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should return the fallback for null or undefined values', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(safeAssign(null, 0, isNumber)).toBe(0);
    expect(safeAssign(undefined, 0, isNumber)).toBe(0);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    consoleWarnSpy.mockRestore();
  });
});