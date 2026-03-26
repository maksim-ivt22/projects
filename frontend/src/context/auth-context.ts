import { createContext, useContext } from "react";
import { User } from "../lib/types/auth/user";
import { LoginInput } from "../lib/types/auth/login-input";
import { RegisterInput } from "../lib/types/auth/register-input";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  register: (input: RegisterInput) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
