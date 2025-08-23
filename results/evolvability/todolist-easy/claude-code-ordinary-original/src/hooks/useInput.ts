import { useState, ChangeEvent } from 'react';

export const useInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(initialValue);
  };

  const clear = () => {
    setValue('');
  };

  return {
    value,
    onChange: handleChange,
    reset,
    clear,
  };
};