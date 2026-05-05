import type { AuthResponse } from '../types/auth';

const PASSKEY_CREDENTIAL_ID_KEY = 'agrosense_passkey_credential_id';
const PASSKEY_SESSION_KEY = 'agrosense_passkey_session';

function ensureBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Passkey sign-in is only available in the browser.');
  }
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer.slice(0);
}

function randomChallenge(length = 32): ArrayBuffer {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge.buffer.slice(0);
}

function textBytes(value: string): ArrayBuffer {
  return new TextEncoder().encode(value).buffer.slice(0);
}

export function isPasskeySupported(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext && 'PublicKeyCredential' in window && !!navigator.credentials;
}

export function hasPasskeyCredential(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.localStorage.getItem(PASSKEY_CREDENTIAL_ID_KEY) && !!window.localStorage.getItem(PASSKEY_SESSION_KEY);
}

export async function enablePasskeyForSession(session: AuthResponse): Promise<{ enabled: boolean; message: string }> {
  ensureBrowser();

  if (!isPasskeySupported()) {
    return { enabled: false, message: 'Passkeys are not supported on this browser/device.' };
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: 'AgroSense AI' },
        user: {
          id: textBytes(session.user.id).slice(0, 64),
          name: session.user.email,
          displayName: session.user.name,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required',
        },
      },
    });

    if (!credential || !(credential instanceof PublicKeyCredential)) {
      return { enabled: false, message: 'Passkey setup was cancelled.' };
    }

    const credentialId = toBase64Url(new Uint8Array(credential.rawId));
    window.localStorage.setItem(PASSKEY_CREDENTIAL_ID_KEY, credentialId);
    window.localStorage.setItem(PASSKEY_SESSION_KEY, JSON.stringify(session));

    return { enabled: true, message: 'Passkey enabled on this device.' };
  } catch {
    return { enabled: false, message: 'Unable to enable passkey on this device.' };
  }
}

export async function signInWithPasskey(): Promise<AuthResponse> {
  ensureBrowser();

  if (!isPasskeySupported()) {
    throw new Error('Passkeys are not supported on this browser/device.');
  }

  const storedCredentialId = window.localStorage.getItem(PASSKEY_CREDENTIAL_ID_KEY);
  const storedSession = window.localStorage.getItem(PASSKEY_SESSION_KEY);

  if (!storedCredentialId || !storedSession) {
    throw new Error('No passkey is configured on this device yet. Sign in with email first.');
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: [
        {
          id: fromBase64Url(storedCredentialId),
          type: 'public-key',
        },
      ],
    },
  });

  if (!assertion || !(assertion instanceof PublicKeyCredential)) {
    throw new Error('Passkey sign-in was cancelled.');
  }

  try {
    return JSON.parse(storedSession) as AuthResponse;
  } catch {
    throw new Error('Stored passkey session is invalid. Sign in with email again.');
  }
}
