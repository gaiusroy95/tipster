import nodemailer from 'nodemailer';

function isMailConfigured(): boolean {
  return Boolean(process.env.MAIL_HOST?.trim() && process.env.MAIL_USER?.trim());
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

function getFromAddress(): string {
  return process.env.MAIL_FROM?.trim() || process.env.MAIL_USER?.trim() || 'noreply@tipsterarena.local';
}

export const mailService = {
  isConfigured(): boolean {
    return isMailConfigured();
  },

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    if (!isMailConfigured()) {
      console.log(`[mail] Password reset (SMTP not configured): ${resetUrl}`);
      return;
    }

    const transport = createTransport();
    await transport.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Reset your password',
      text: `Reset your password using this link (expires in 1 hour): ${resetUrl}`,
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      `,
    });
  },

  async sendVerificationEmail(email: string, verifyUrl: string): Promise<void> {
    if (!isMailConfigured()) {
      console.log(`[mail] Verify email (SMTP not configured): ${verifyUrl}`);
      return;
    }

    const transport = createTransport();
    await transport.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Verify your Tipster Arena account',
      text: `Welcome! Verify your email to activate your account (link expires in 24 hours): ${verifyUrl}`,
      html: `
        <p>Welcome to Tipster Arena!</p>
        <p>Please verify your email address to activate your account and receive your welcome credits.</p>
        <p><a href="${verifyUrl}">Verify my email</a></p>
        <p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>
      `,
    });
  },
};
