import { z } from 'zod';
import {
  BLOCKED_REGISTRATION_EMAIL_MESSAGE,
  isBlockedRegistrationEmail,
} from './blocked-email-domains';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 50;

const USERNAME_PATTERN = /^[a-z0-9_]+$/;
const PASSWORD_LETTER = /[A-Za-z]/;
const PASSWORD_DIGIT = /\d/;

export const usernameField = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
  .regex(USERNAME_PATTERN, 'Username can only contain lowercase letters, numbers, and underscores')
  .transform((value) => value.toLowerCase());

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(EMAIL_MAX_LENGTH, 'Email is too long')
  .email('Invalid email address')
  .transform((value) => value.toLowerCase())
  .refine((value) => !isBlockedRegistrationEmail(value), BLOCKED_REGISTRATION_EMAIL_MESSAGE);

export const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, 'Password is too long')
  .refine((value) => PASSWORD_LETTER.test(value), 'Password must contain at least one letter')
  .refine((value) => PASSWORD_DIGIT.test(value), 'Password must contain at least one number');

export const loginPasswordField = z.string().min(1, 'Password is required');
