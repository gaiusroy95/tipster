import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { handleRequest, type LifeCycleEventsMap, type RequestHandler } from 'msw'
import { Emitter } from 'strict-event-emitter'

type ConnectNext = (err?: unknown) => void

const emitter = new Emitter<LifeCycleEventsMap>()

function getServerOrigin(req: IncomingMessage): string {
  const host = req.headers.host ?? 'localhost:5173'
  const forwarded = req.headers['x-forwarded-proto']
  const protocol =
    typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'http'
  return `${protocol}://${host}`
}

/**
 * Connect-compatible MSW middleware for Vite dev server (plain IncomingMessage, not Express).
 */
export function createConnectMswMiddleware(handlers: RequestHandler[]) {
  return (req: IncomingMessage, res: ServerResponse, next: ConnectNext) => {
    const method = req.method ?? 'GET'
    const serverOrigin = getServerOrigin(req)
    const canRequestHaveBody = method !== 'HEAD' && method !== 'GET'

    const fetchRequest = new Request(new URL(req.url ?? '/', serverOrigin), {
      method,
      headers: new Headers(req.headers as Record<string, string>),
      credentials: 'omit',
      duplex: canRequestHaveBody ? 'half' : undefined,
      body:
        canRequestHaveBody && req.readable
          ? (Readable.toWeb(req) as ReadableStream<Uint8Array>)
          : undefined,
    })

    handleRequest(fetchRequest, randomUUID(), handlers, {
      onUnhandledRequest: () => null,
    }, emitter, {
      resolutionContext: { baseUrl: serverOrigin },
      onMockedResponse(mockedResponse) {
        res.statusCode = mockedResponse.status
        res.statusMessage = mockedResponse.statusText
        mockedResponse.headers.forEach((value, name) => {
          res.appendHeader(name, value)
        })
        if (mockedResponse.body) {
          Readable.fromWeb(mockedResponse.body).pipe(res)
        } else {
          res.end()
        }
      },
      onPassthroughResponse() {
        next()
      },
    }).catch(next)
  }
}
