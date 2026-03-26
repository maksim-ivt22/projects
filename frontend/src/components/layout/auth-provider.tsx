"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { User } from "../../lib/types/auth/user";
import authService from "../../services/auth-service";
import { LoginInput } from "../../lib/types/auth/login-input";
import { RegisterInput } from "../../lib/types/auth/register-input";
import { AuthContext, AuthContextType } from "../../context/auth-context";
import { getAccessToken, setAccessToken } from "../../lib/token-manager";
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from "../../lib/auth-storage";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!getAccessToken()) {
      console.warn("fetchUser called without an access token.");
      return; // Should not happen if called correctly after login/refresh
    }
    // *** CRITICAL ***: Ensure your api client uses getAccessToken()
    try {
      const fetchedUser = await authService.getMe();
      setUser(fetchedUser);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch user with current token:", err);
      // This might indicate the in-memory token is invalid,
      // though interceptors should ideally handle refresh *before* this fails.
      // For robustness, we could clear state here, but logout might be better.
      setUser(null); // Clear user if getMe fails
      setError("Failed to verify session.");
      // Consider calling logout() here if getMe fails definitively
    }
  }, [authService]);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const tokens = await authService.refreshToken({ refresh: refreshToken });
      setStoredRefreshToken(tokens.refresh);
      setAccessToken(tokens.access);
      // *** CRITICAL ***: Your api client (e.g., Axios interceptor) must now
      // be configured to use this new access token via getAccessToken()

      await fetchUser(); // Fetch user data with the new token
    } catch (err: any) {
      console.error("Token refresh failed during initialization:", err);
      setAccessToken(null);
      removeStoredRefreshToken();
      setUser(null);
      setError("Session expired. Please log in.");
    } finally {
      setIsLoading(false);
    }
  }, [authService, fetchUser]);

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeAuth]);

  const login = useCallback(
    async (input: LoginInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const tokens = await authService.login(input);
        setStoredRefreshToken(tokens.refresh);
        setAccessToken(tokens.access);
        // *** CRITICAL ***: Ensure api client uses getAccessToken() now

        await fetchUser();
      } catch (err: any) {
        console.error("Login failed:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Login failed.";
        setError(errorMessage);
        setAccessToken(null);
        removeStoredRefreshToken();
        setUser(null);
        setIsLoading(false);
        throw err;
      } finally {
        // fetchUser handles setting user/error on success/failure
        // but we ensure loading is false if fetchUser wasn't reached or errored early
        setIsLoading(false);
      }
    },
    [authService, fetchUser]
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    removeStoredRefreshToken();
    setUser(null);
    setError(null);
    // *** CRITICAL ***: Ensure api client clears any Authorization header
    // e.g., by having its interceptor read null from getAccessToken()
  }, []);

  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const registeredUser = await authService.register(input);
        setIsLoading(false);
        return registeredUser;
      } catch (err: any) {
        console.error("Registration failed:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Registration failed.";
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    [authService]
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      register,
    }),
    [user, isLoading, error, login, logout, register]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
