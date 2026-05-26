import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    const messageFromData =
      (typeof data?.detail === "string" && data.detail) ||
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error);

    if (messageFromData) {
      return messageFromData;
    }

    if (status === 404) {
      return "Endpoint не найден (404). Проверьте NEXT_PUBLIC_API_BASE_URL/NEXT_PUBLIC_API_URL и backend URL.";
    }

    return `Ошибка API${status ? ` (${status})` : ""}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка";
}
