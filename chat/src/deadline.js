// AbortSignal.timeout() does not keep Node running: a wait on it alone ends the process with the promise pending.
// This timer does, and clear() drops it once the work is done.
export function deadline(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('deadline passed', 'TimeoutError')), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}
