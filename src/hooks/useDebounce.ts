/* 
hooks/useDebounce.ts

useDebounce custom hook implementation to use with Apollo Client's useLazyQuery for live search bar

This is a reusable hook that takes a value and a delay, and only returns the new value after the specified delay has passed without any changes.

*/

import { useState, useEffect } from 'react';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay is over
    // Basically, this resets the timer
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
