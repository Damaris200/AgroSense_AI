import type { AuthResponse } from '@/types/auth';

const CREDENTIAL_ID_KEY = 'agrosense_passkey_credential_id';
const SESSION_KEY       = 'agrosense_passkey_session';

export function isPasskeySupported(): boolean {
  return (
    globalThis.isSecureContext === true &&
    typeof (globalThis as Record<string, unknown>).PublicKeyCredential !== 'undefined'
  );
}

export function hasPasskeyCredential(): boolean {
  return (
    localStorage.getItem(CREDENTIAL_ID_KEY) !== null &&
    localStorage.getItem(SESSION_KEY) !== null
  );
}

export async function enablePasskeyForSession(
  session: AuthResponse,
): Promise<{ enabled: boolean; message: string }> {
  if (!isPasskeySupported()) {
    return { enabled: false, message: 'Passkeys are not supported on this device.' };
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'AgroSense AI', id: globalThis.location.hostname },
        user: {
          id: new TextEncoder().encode(session.user.id),
          name: session.user.email,
          displayName: session.user.name,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'required',
        },
        timeout: 60000,
      },
    });

    if (!credential) {
      return { enabled: false, message: 'Passkey creation was cancelled.' };
    }

    const credentialId = btoa(
      String.fromCharCode(...new Uint8Array((credential as PublicKeyCredential).rawId)),
    );

    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: session.token }));

    return { enabled: true, message: 'Passkey enabled successfully.' };
  } catch {
    return { enabled: false, message: 'Failed to create passkey. Try again later.' };
  }
}

export async function signInWithPasskey(): Promise<AuthResponse> {
  if (!isPasskeySupported()) {
    throw new Error('Passkeys are not supported on this device.');
  }

  const storedSession = localStorage.getItem(SESSION_KEY);
  if (!storedSession) {
    throw new Error('No passkey registered on this device.');
  }

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      userVerification: 'required',
      timeout: 60000,
    },
  });

  if (!credential) {
    throw new Error('Passkey authentication was cancelled.');
  }

  const session = JSON.parse(storedSession) as { token: string };
  return {
    user: {} as AuthResponse['user'],
    token: session.token,
  };
}
