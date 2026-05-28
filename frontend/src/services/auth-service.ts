import api from "../lib/api-client";
import { AuthToken } from "../lib/types/auth/auth-token";
import { LoginInput } from "../lib/types/auth/login-input";
import { RefreshTokenInput } from "../lib/types/auth/refresh-token-input";
import { RegisterInput } from "../lib/types/auth/register-input";
import { User } from "../lib/types/auth/user";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export type SendVerificationCodeResponse = {
  detail: string;
  verification_code?: string;
};

class AuthService {
  async getMe(): Promise<User> {
    const user: User = (await api.get(API_ENDPOINTS.auth.me)).data;
    return user;
  }

  async register(input: RegisterInput): Promise<User> {
    const user: User = (await api.post(API_ENDPOINTS.auth.register, input))
      .data;
    return user;
  }

  async sendVerificationCode(
    email: string,
  ): Promise<SendVerificationCodeResponse> {
    const response = await api.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.auth.sendVerificationCode,
      { email },
    );
    return response.data;
  }

  async verifyCode(input: {
    email: string;
    code: string;
  }): Promise<{ verified: boolean }> {
    const response = await api.post<{ verified: boolean }>(
      API_ENDPOINTS.auth.verifyCode,
      input,
    );
    return response.data;
  }

  async login(input: LoginInput): Promise<AuthToken> {
    const authToken: AuthToken = (
      await api.post(API_ENDPOINTS.auth.token, input)
    ).data;
    return authToken;
  }

  async refreshToken(input: RefreshTokenInput): Promise<AuthToken> {
    const authToken: AuthToken = (
      await api.post(API_ENDPOINTS.auth.refresh, input)
    ).data;
    return authToken;
  }
}

export default new AuthService();
