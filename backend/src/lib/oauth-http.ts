import axios, { type AxiosRequestConfig } from 'axios';
import dns from 'node:dns';
import https from 'node:https';

/** Prefer IPv4 — avoids hangs reaching Google OAuth on some Windows networks. */
dns.setDefaultResultOrder('ipv4first');

const oauthHttpsAgent = new https.Agent({
  keepAlive: true,
  family: 4,
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const code = error.code ?? '';
  return (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ECONNREFUSED'
  );
}

function buildAxiosConfig(timeoutMs: number): AxiosRequestConfig {
  return {
    timeout: timeoutMs,
    httpsAgent: oauthHttpsAgent,
    validateStatus: () => true,
  };
}

export async function postOAuthForm(
  url: string,
  body: URLSearchParams,
  options?: { timeoutMs?: number; retries?: number },
): Promise<{ status: number; data: unknown }> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const maxAttempts = (options?.retries ?? 2) + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.post(url, body.toString(), {
        ...buildAxiosConfig(timeoutMs),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return { status: res.status, data: res.data };
    } catch (error) {
      lastError = error;
      if (!isRetryableNetworkError(error) || attempt >= maxAttempts) {
        throw error;
      }
      await sleep(attempt * 1500);
    }
  }

  throw lastError;
}

export async function getOAuthJson<T>(
  url: string,
  headers: Record<string, string>,
  options?: { timeoutMs?: number; retries?: number },
): Promise<{ status: number; data: T }> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const maxAttempts = (options?.retries ?? 2) + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.get<T>(url, {
        ...buildAxiosConfig(timeoutMs),
        headers,
      });
      return { status: res.status, data: res.data };
    } catch (error) {
      lastError = error;
      if (!isRetryableNetworkError(error) || attempt >= maxAttempts) {
        throw error;
      }
      await sleep(attempt * 1500);
    }
  }

  throw lastError;
}

export function isOAuthNetworkError(error: unknown): boolean {
  return isRetryableNetworkError(error);
}
