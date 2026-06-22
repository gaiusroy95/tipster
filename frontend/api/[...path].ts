import type { IncomingMessage, ServerResponse } from 'node:http'
import { createConnectMswMiddleware } from '../vite/connectMswMiddleware'
import { handlers } from '../src/mocks/handlers/index'

const mockApi = createConnectMswMiddleware(handlers)

export default function handler(req: IncomingMessage, res: ServerResponse) {
  mockApi(req, res, () => {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: 'NOT_FOUND', message: 'Not found' }))
  })
}

/** Raw body stream so MSW can read POST JSON (login, register, etc.). */
export const config = {
  api: {
    bodyParser: false,
  },
}
