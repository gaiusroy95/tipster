export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 4,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.ok) {
        const body = await response.text()
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`)
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error
      if (attempt >= retries) break
      const delay = baseDelayMs * 2 ** attempt
      await sleep(delay)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed')
}
