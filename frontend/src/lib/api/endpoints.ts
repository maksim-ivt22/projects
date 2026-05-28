export const API_ENDPOINTS = {
  auth: {
    register: "auth/register/",
    sendVerificationCode: "auth/send-verification-code/",
    verifyCode: "auth/verify-code/",
    token: "auth/token/",
    refresh: "auth/token/refresh/",
    me: "auth/me/",
  },
} as const;
