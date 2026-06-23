import axios from 'axios'
import { env } from '@/core/config/env'

export const sportsClient = axios.create({
  baseURL: env.sportsApiUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})
