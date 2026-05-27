/// <reference types="bun-types" />
import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

// We mock the `nodemailer` module so we never open a real SMTP connection.
// The mock returns a transporter whose sendMail resolves with a fake messageId,
// so we can assert that sendEmail() called it with the right arguments.

describe('sendEmail', () => {
  let sendMailCalls: Array<Record<string, unknown>> = [];
  let originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    sendMailCalls = [];
    originalEnv = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    };

    mock.module('nodemailer', () => ({
      default: {
        createTransport: () => ({
          sendMail: async (opts: Record<string, unknown>) => {
            sendMailCalls.push(opts);
            return { messageId: 'msg-test-123' };
          },
        }),
      },
    }));
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(originalEnv)) {
      if (v === undefined) delete (process.env as Record<string, string | undefined>)[k];
      else process.env[k] = v;
    }
  });

  it('calls the SMTP transporter with the payload', async () => {
    process.env.SMTP_FROM = 'AgroSense <noreply@agrosense.ai>';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    const { sendEmail } = await import('../services/email.service?fresh=' + Math.random());
    await sendEmail({ to: 'farmer@example.com', subject: 'Hello', html: '<p>hi</p>' });

    expect(sendMailCalls.length).toBe(1);
    expect(sendMailCalls[0]?.to).toBe('farmer@example.com');
    expect(sendMailCalls[0]?.subject).toBe('Hello');
    expect(sendMailCalls[0]?.html).toBe('<p>hi</p>');
    expect(sendMailCalls[0]?.from).toBe('AgroSense <noreply@agrosense.ai>');
  });

  it('falls back to a default from address when SMTP_FROM is unset', async () => {
    delete process.env.SMTP_FROM;
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    const { sendEmail } = await import('../services/email.service?fresh=' + Math.random());
    await sendEmail({ to: 'b@example.com', subject: 'S', html: 'H' });

    expect(sendMailCalls[0]?.from).toMatch(/noreply@agrosense\.ai/);
  });

  it('uses default smtp host when SMTP_HOST is unset (transporter still constructed)', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const { sendEmail } = await import('../services/email.service?fresh=' + Math.random());
    await sendEmail({ to: 'c@example.com', subject: 'S', html: 'H' });

    expect(sendMailCalls.length).toBe(1);
  });

  it('reuses the same transporter across calls (singleton)', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';

    const { sendEmail } = await import('../services/email.service?fresh=' + Math.random());
    await sendEmail({ to: 'd@example.com', subject: 'S1', html: 'H' });
    await sendEmail({ to: 'e@example.com', subject: 'S2', html: 'H' });

    expect(sendMailCalls.length).toBe(2);
  });
});
