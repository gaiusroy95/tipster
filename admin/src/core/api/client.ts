import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/core/config/env'
import { ApiError, type ApiErrorBody } from '@/core/types/api'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.data) {
      throw new ApiError(error.response.status, error.response.data)
    }
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network error' })
  },
)

export const adminClient = axios.create({
  baseURL: `${env.apiUrl}/admin`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.data) {
      throw new ApiError(error.response.status, error.response.data)
    }
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network error' })
  },
)
