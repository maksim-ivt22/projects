let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  currentAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return currentAccessToken;
};
