/** Run async fn with exponential backoff on failure. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; baseDelayMs?: number; label?: string }
): Promise<T> {
  const attempts = Math.max(1, options?.attempts ?? 3);
  const base = options?.baseDelayMs ?? 400;
  const label = options?.label ?? "retry";
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === attempts - 1) break;
      const wait = base * Math.pow(2, i);
      console.warn(`[${label}] attempt ${i + 1}/${attempts} failed, retry in ${wait}ms`, e);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
