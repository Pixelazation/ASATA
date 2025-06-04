type DebouncedAsyncFn<T extends (...args: any[]) => Promise<any>> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  wait: number
): DebouncedAsyncFn<T> {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<any> | null = null;
  let lastArgs: Parameters<T>;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    lastArgs = args;

    if (timeout) clearTimeout(timeout);

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve) => {
        timeout = setTimeout(async () => {
          const result = await fn(...lastArgs);
          resolve(result);
          pendingPromise = null;
        }, wait);
      });
    }

    return pendingPromise;
  };
}
