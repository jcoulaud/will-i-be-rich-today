export function debounce<F extends (...args: never[]) => unknown>(
  func: F,
  wait: number,
): {
  (...args: Parameters<F>): void;
  cancel: () => void;
} {
  let timeout: NodeJS.Timeout | null = null;

  const debouncedFn = (...args: Parameters<F>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  debouncedFn.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFn;
}
