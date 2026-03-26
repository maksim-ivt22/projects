import api from "../lib/api-client";
import { AuthToken } from "../lib/types/auth/auth-token";
import { LoginInput } from "../lib/types/auth/login-input";
import { RefreshTokenInput } from "../lib/types/auth/refresh-token-input";
import { RegisterInput } from "../lib/types/auth/register-input";
import { User } from "../lib/types/auth/user";

class AuthService {
  async getMe(): Promise<User> {
    const user: User = (await api.get("auth/me/")).data;
    return user;
  }

  async register(input: RegisterInput): Promise<User> {
    const authToken: User = (await api.post("auth/register/", input)).data;
    return authToken;
  }

  async login(input: LoginInput): Promise<AuthToken> {
    const authToken: AuthToken = (await api.post("auth/token/", input)).data;
    return authToken;
  }

  async refreshToken(input: RefreshTokenInput): Promise<AuthToken> {
    const authToken: AuthToken = (await api.post("auth/token/refresh/", input))
      .data;
    return authToken;
  }
}

export default new AuthService();
