const TOKEN_STORAGE_KEY = 'talentpulse_token';

let inMemoryToken: string | null = null;

function purgePersistedTokens(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access errors in restricted iframe contexts
  }
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access errors in restricted iframe contexts
  }
}

export function getAuthToken(): string | null {
  purgePersistedTokens();
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  purgePersistedTokens();
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  purgePersistedTokens();
}
