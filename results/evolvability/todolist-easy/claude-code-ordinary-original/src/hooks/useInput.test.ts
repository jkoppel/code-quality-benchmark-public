import { renderHook, act } from '@testing-library/react';
import { useInput } from './useInput';

describe('useInput', () => {
  test('should initialize with empty string by default', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current.value).toBe('');
  });

  test('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useInput('initial value'));
    expect(result.current.value).toBe('initial value');
  });

  test('should update value when onChange is called', () => {
    const { result } = renderHook(() => useInput());
    
    act(() => {
      const mockEvent = {
        target: { value: 'new value' }
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.onChange(mockEvent);
    });

    expect(result.current.value).toBe('new value');
  });

  test('should reset value to initial value', () => {
    const { result } = renderHook(() => useInput('initial'));
    
    act(() => {
      const mockEvent = {
        target: { value: 'changed value' }
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.onChange(mockEvent);
    });

    expect(result.current.value).toBe('changed value');

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('initial');
  });

  test('should clear value to empty string', () => {
    const { result } = renderHook(() => useInput('initial value'));

    act(() => {
      result.current.clear();
    });

    expect(result.current.value).toBe('');
  });
});