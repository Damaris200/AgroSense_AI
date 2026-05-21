import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isPasskeySupported, hasPasskeyCredential } from '@/utils/passkey';

const CREDENTIAL_ID_KEY = 'agrosense_passkey_credential_id';
const SESSION_KEY       = 'agrosense_passkey_session';

function defineSecureContext(value: boolean) {
  Object.defineProperty(window, 'isSecureContext', {
    value,
    writable:     true,
    configurable: true,
  });
}

describe('isPasskeySupported', () => {
  afterEach(() => {
    defineSecureContext(true);
  });

  it('returns false when not in a secure context', () => {
    defineSecureContext(false);
    expect(isPasskeySupported()).toBe(false);
  });

  it('returns false when PublicKeyCredential is absent', () => {
    defineSecureContext(true);
    const original = (window as unknown as Record<string, unknown>).PublicKeyCredential;
    delete (window as unknown as Record<string, unknown>).PublicKeyCredential;

    expect(isPasskeySupported()).toBe(false);

    (window as unknown as Record<string, unknown>).PublicKeyCredential = original;
  });

  it('returns a boolean in a normal secure jsdom context', () => {
    defineSecureContext(true);
    expect(typeof isPasskeySupported()).toBe('boolean');
  });
});

describe('hasPasskeyCredential', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns false when neither key is stored', () => {
    expect(hasPasskeyCredential()).toBe(false);
  });

  it('returns false when only credential ID is stored', () => {
    localStorage.setItem(CREDENTIAL_ID_KEY, 'some-credential-id');
    expect(hasPasskeyCredential()).toBe(false);
  });

  it('returns false when only session is stored', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'abc' }));
    expect(hasPasskeyCredential()).toBe(false);
  });

  it('returns true when both credential ID and session are stored', () => {
    localStorage.setItem(CREDENTIAL_ID_KEY, 'some-credential-id');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'abc' }));
    expect(hasPasskeyCredential()).toBe(true);
  });

  it('returns false after localStorage is cleared', () => {
    localStorage.setItem(CREDENTIAL_ID_KEY, 'cred');
    localStorage.setItem(SESSION_KEY, '{}');
    localStorage.clear();
    expect(hasPasskeyCredential()).toBe(false);
  });
});
