/**
 * Browser MSW worker — not used by default.
 * API mocking runs via Vite middleware (@see vite-plugin-mock-api.ts) to avoid
 * Service Worker passthrough errors without a backend.
 */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
