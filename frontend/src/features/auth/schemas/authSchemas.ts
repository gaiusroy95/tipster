import { z } from 'zod'

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 24
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const EMAIL_MAX_LENGTH = 254

const BLOCKED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test',
  'invalid',
  'localhost',
])

const BLOCKED_EMAIL_MESSAGE =
  'This email domain cannot be used for registration. Please use a real email address.'

function isBlockedRegistrationEmail(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase()
  if (!domain) return true
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return true
  return domain.endsWith('.test') || domain.endsWith('.local') || domain.endsWith('.localhost')
}

const USERNAME_PATTERN = /^[a-z0-9_]+$/
const PASSWORD_LETTER = /[A-Za-z]/
const PASSWORD_DIGIT = /\d/

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(EMAIL_MAX_LENGTH, 'Email is too long')
  .email('Invalid email address')
  .transform((value) => value.toLowerCase())
  .refine((value) => !isBlockedRegistrationEmail(value), BLOCKED_EMAIL_MESSAGE)

const usernameField = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
  .regex(USERNAME_PATTERN, 'Username can only contain lowercase letters, numbers, and underscores')
  .transform((value) => value.toLowerCase())

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, 'Password is too long')
  .refine((value) => PASSWORD_LETTER.test(value), 'Password must contain at least one letter')
  .refine((value) => PASSWORD_DIGIT.test(value), 'Password must contain at least one number')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  username: usernameField,
  email: emailField,
  password: passwordField,
})

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const resetPasswordSchema = z.object({
  password: passwordField,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasLetter: PASSWORD_LETTER.test(password),
    hasNumber: PASSWORD_DIGIT.test(password),
  }
}
