export interface ApiResponse<T> {
  data: T
}

export interface ApiErrorBody {
  code: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
  }
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  username: string
  balance: number
  rank: number
  role: 'USER' | 'ADMIN'
  isBanned: boolean
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
