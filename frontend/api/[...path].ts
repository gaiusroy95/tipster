import type { IncomingMessage, ServerResponse } from 'node:http'

/** Default Render backend — override with BACKEND_URL in Vercel env. */
const DEFAULT_BACKEND_ORIGIN = 'https://tipster-wqhx.onrender.com'

function readRequestBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined))
    req.on('error', reject)
  })
}

function getBackendOrigin(): string {
  const raw =
    process.env.BACKEND_URL?.trim() ||
    process.env.RENDER_BACKEND_URL?.trim() ||
    process.env.VITE_BACKEND_URL?.trim() ||
    DEFAULT_BACKEND_ORIGIN
  return raw.replace(/\/+$/, '').replace(/\/api$/, '')
}

async function proxyToBackend(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const backendOrigin = getBackendOrigin()
  const host = req.headers.host ?? 'localhost'
  const forwardedProto = req.headers['x-forwarded-proto']
  const protocol =
    typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : 'https'
  const incoming = new URL(req.url ?? '/', `${protocol}://${host}`)
  const targetUrl = `${backendOrigin}${incoming.pathname}${incoming.search}`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || key === 'host' || key === 'connection') continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }

  const body = await readRequestBody(req)

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  })

  res.statusCode = upstream.status
  upstream.headers.forEach((value, key) => {
    if (key === 'transfer-encoding' || key === 'content-encoding') return
    res.setHeader(key, value)
  })

  const buffer = Buffer.from(await upstream.arrayBuffer())
  res.end(buffer)
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await proxyToBackend(req, res)
}

/** Raw body stream for POST JSON (login, OAuth, etc.). */
export const config = {
  api: {
    bodyParser: false,
  },
}
