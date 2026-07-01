import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/core/config/env'
import { ApiError, type ApiErrorBody } from '@/core/types/api'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken() {
  return authToken
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  // Let the browser set multipart boundary — a manual Content-Type breaks uploads.
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody | string>) => {
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'object' && data !== null && typeof data.message === 'string') {
        throw new ApiError(error.response.status, data)
      }
      const status = error.response.status
      const message =
        status === 404
          ? 'This feature is not available yet. Please refresh and try again.'
          : status >= 500
            ? 'Server error. Please try again in a moment.'
            : `Request failed (${status})`
      throw new ApiError(status, { code: 'HTTP_ERROR', message })
    }
    if (error.code === 'ECONNABORTED') {
      throw new ApiError(0, {
        code: 'TIMEOUT',
        message: 'Request timed out. Please wait a moment and try again.',
      })
    }
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network error. Please try again.' })
  },
)
