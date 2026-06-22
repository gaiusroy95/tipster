export const mockApiBase = '/api'

export function mockApiPath(path: string): string {
  return `${mockApiBase}${path.startsWith('/') ? path : `/${path}`}`
}
