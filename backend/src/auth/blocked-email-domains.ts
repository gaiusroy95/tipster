/** RFC 2606 / reserved domains — must never be used for real sign-ups. */
const BLOCKED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test',
  'invalid',
  'localhost',
]);

export const BLOCKED_REGISTRATION_EMAIL_MESSAGE =
  'This email domain cannot be used for registration. Please use a real email address.';

export function isTestRegistrationAllowed(): boolean {
  return process.env.ALLOW_TEST_REGISTRATIONS === 'true';
}

export function isBlockedRegistrationEmail(email: string): boolean {
  if (isTestRegistrationAllowed()) return false;

  const domain = email.split('@')[1]?.trim().toLowerCase();
  if (!domain) return true;

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return true;
  if (domain.endsWith('.test') || domain.endsWith('.local') || domain.endsWith('.localhost')) {
    return true;
  }

  return false;
}

export function getEmailDomain(email: string): string | null {
  const domain = email.split('@')[1]?.trim().toLowerCase();
  return domain || null;
}
