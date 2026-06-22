export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: Record<string, string[]>

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}
