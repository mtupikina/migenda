import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { env } from '../env';

interface ParsedSender {
  name: string;
  email: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const subject = 'Reset your MiGenda password';
    const text = [
      'We received a request to reset your MiGenda password.',
      '',
      `Reset your password: ${resetUrl}`,
      '',
      'This link expires in one hour. If you did not request a reset, you can ignore this email.',
    ].join('\n');
    const html = `
      <p>We received a request to reset your MiGenda password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
    `.trim();

    if (!env.brevoApiKey) {
      this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
      return;
    }

    await this.sendEmail(to, subject, html, text, resetUrl);
    this.logger.log(`Password reset email sent to ${to}`);
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    resetUrl: string,
  ) {
    const sender = this.parseSender(
      env.emailFrom ?? 'MiGenda <noreply@example.com>',
    );

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.brevoApiKey!,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      this.logger.error(`Failed to send password reset email to ${to}: ${detail}`);
      this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
      throw new InternalServerErrorException('Could not send email');
    }
  }

  private parseSender(value: string): ParsedSender {
    const match = value.match(/^(.+?)\s*<([^>]+)>$/);

    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }

    return { name: 'MiGenda', email: value.trim() };
  }
}
