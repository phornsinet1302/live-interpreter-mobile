/**
 * Races a promise against a timeout so a hung network/SDK call (e.g. Clerk
 * unreachable, a request that never resolves) fails loudly instead of
 * leaving the UI stuck forever with a spinner and no feedback.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
