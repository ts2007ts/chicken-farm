import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
  });

  it('initializes with stored value when it exists', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('storedValue');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('updated'));
  });

  it('handles object values correctly', () => {
    const initialObject = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('userKey', initialObject));
    
    expect(result.current[0]).toEqual(initialObject);
    
    const updatedObject = { name: 'Jane', age: 25 };
    act(() => {
      result.current[1](updatedObject);
    });
    
    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('userKey'))).toEqual(updatedObject);
  });

  it('handles array values correctly', () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('arrayKey', initialArray));
    
    expect(result.current[0]).toEqual(initialArray);
    
    const updatedArray = [4, 5, 6];
    act(() => {
      result.current[1](updatedArray);
    });
    
    expect(result.current[0]).toEqual(updatedArray);
  });

  it('handles null values', () => {
    const { result } = renderHook(() => useLocalStorage('nullKey', null));
    
    expect(result.current[0]).toBeNull();
    
    act(() => {
      result.current[1]('notNull');
    });
    
    expect(result.current[0]).toBe('notNull');
  });

  it('persists across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('persistKey', 'initial'));
    
    act(() => {
      result.current[1]('changed');
    });
    
    rerender();
    
    expect(result.current[0]).toBe('changed');
  });
});
