import { z } from 'zod';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  emailField,
  loginPasswordField,
  passwordField,
  usernameField,
} from '../auth/auth.validation';

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN_LENGTH, `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`)
    .max(DISPLAY_NAME_MAX_LENGTH, `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`),
  username: usernameField,
});

export const loginSchema = z.object({
  email: emailField,
  password: loginPasswordField,
  trustToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordField,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: emailField,
});

export const checkUsernameSchema = z.object({
  username: usernameField,
});

export const checkEmailSchema = z.object({
  email: emailField,
});
