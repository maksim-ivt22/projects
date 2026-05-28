const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_ACCESS_TOKEN_KEYS = ["access"];

let currentAccessToken: string | null = null;

const getBrowserStorageToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);

    if (storedToken) {
      return storedToken;
    }

    for (const key of LEGACY_ACCESS_TOKEN_KEYS) {
      const legacyToken =
        sessionStorage.getItem(key) || localStorage.getItem(key);

      if (legacyToken) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
        return legacyToken;
      }
    }

    return null;
  } catch (error) {
    console.error("Could not access token storage:", error);
    return null;
  }
};

export const setAccessToken = (token: string | null): void => {
  currentAccessToken = token;

  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);

      for (const key of LEGACY_ACCESS_TOKEN_KEYS) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Could not update token storage:", error);
  }
};

export const getAccessToken = (): string | null => {
  if (currentAccessToken) {
    return currentAccessToken;
  }

  currentAccessToken = getBrowserStorageToken();
  return currentAccessToken;
};
