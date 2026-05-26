const DEFAULT_API_BASE_URL = "http://localhost:8000/";

const envApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL = (envApiUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "") + "/";
