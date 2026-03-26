const REFRESH_TOKEN_KEY = "refreshToken";

export const getStoredRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Could not access localStorage:", error);
    return null;
  }
};

export const setStoredRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Could not access localStorage:", error);
  }
};

export const removeStoredRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Could not access localStorage:", error);
  }
};
