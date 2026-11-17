const TOKEN_STORAGE_KEY = 'talentpulse_token';

let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  } catch {
    // Ignore storage access errors in restricted iframe contexts
  }
  return null;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage access errors in restricted iframe contexts
  }
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access errors in restricted iframe contexts
  }
}
