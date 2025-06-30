// src/utils/index.ts

/**
 * Fetch with a timeout using AbortController
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 2000,
): Promise<Response> {
  const controller = new AbortController();
  const fetchPromise = fetch(url, { ...options, signal: controller.signal });
  const timeoutPromise = new Promise<Response>((_, reject) =>
    setTimeout(() => {
      controller.abort();
      reject(new Error('Timeout'));
    }, timeoutMs),
  );
  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } finally {
    // Clear any remaining timeouts if fetch wins the race
  }
}
