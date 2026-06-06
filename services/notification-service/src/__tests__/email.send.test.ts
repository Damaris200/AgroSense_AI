/// <reference types="bun-types" />
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// We stub the global `fetch` so the test never makes a real SendGrid API call.
// sendEmail() reads SENDGRID_API_KEY / SMTP_USER and fetch() at call time, so
// stubbing here is enough — no live key or network needed.

import { sendEmail } from '../services/email.service';

describe('sendEmail (SendGrid)', () => {
  type Captured = { url: string; init: { method?: string; headers?: Record<string, string>; body?: string } };
  let fetchCalls: Captured[] = [];
  const realFetch = globalThis.fetch;
  let originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    fetchCalls = [];
    originalEnv = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      SMTP_USER: process.env.SMTP_USER,
    };
    // Default stub: capture the call and return a successful (202) response.
    globalThis.fetch = (async (url: unknown, init: unknown) => {
      fetchCalls.push({ url: String(url), init: (init ?? {}) as Captured['init'] });
      return new Response('', { status: 202 });
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    for (const [k, v] of Object.entries(originalEnv)) {
      if (v === undefined) delete (process.env as Record<string, string | undefined>)[k];
      else process.env[k] = v;
    }
  });

  it('POSTs to the SendGrid API with the email payload', async () => {
    process.env.SENDGRID_API_KEY = 'SG.test-key';
    process.env.SMTP_USER = 'sender@example.com';

    await sendEmail({ to: 'farmer@example.com', subject: 'Hello', html: '<p>hi</p>' });

    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toContain('api.sendgrid.com');
    expect(fetchCalls[0].init.method).toBe('POST');
    expect(fetchCalls[0].init.headers?.Authorization).toBe('Bearer SG.test-key');

    const body = JSON.parse(fetchCalls[0].init.body as string);
    expect(body.personalizations[0].to[0].email).toBe('farmer@example.com');
    expect(body.subject).toBe('Hello');
    expect(body.content[0].value).toBe('<p>hi</p>');
    expect(body.from.email).toBe('sender@example.com');
  });

  it('uses SMTP_USER as the from address', async () => {
    process.env.SENDGRID_API_KEY = 'SG.test-key';
    process.env.SMTP_USER = 'custom@from.com';

    await sendEmail({ to: 'x@y.com', subject: 'S', html: 'H' });

    const body = JSON.parse(fetchCalls[0].init.body as string);
    expect(body.from.email).toBe('custom@from.com');
  });

  it('throws when SendGrid responds with a non-OK status', async () => {
    process.env.SENDGRID_API_KEY = 'SG.bad-key';
    globalThis.fetch = (async () => new Response('Unauthorized', { status: 401 })) as unknown as typeof fetch;

    await expect(
      sendEmail({ to: 'a@b.com', subject: 'S', html: 'H' }),
    ).rejects.toThrow(/SendGrid error 401/);
  });
});
