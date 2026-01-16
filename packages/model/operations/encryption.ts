import Cryptr from 'cryptr';

let cryptrInstance: Cryptr | null = null;

const getCryptr = (): Cryptr => {
  if (!cryptrInstance) {
    const secret = process.env.TOKEN_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error('TOKEN_ENCRYPTION_KEY is required');
    }
    cryptrInstance = new Cryptr(secret);
  }
  return cryptrInstance;
};

export const encryptToken = (token: string): string => {
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('Cannot encrypt empty token');
  }
  return getCryptr().encrypt(token);
};

export const decryptToken = (encrypted: string | null | undefined): string => {
  if (!encrypted) return '';

  try {
    return getCryptr().decrypt(encrypted);
  } catch {
    throw new Error('Token decryption failed - check TOKEN_ENCRYPTION_KEY');
  }
};
