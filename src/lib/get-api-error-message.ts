import axios from "axios";

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseError = error.response?.data?.error;

  if (typeof responseError === "string") {
    return responseError;
  }

  if (responseError && typeof responseError === "object") {
    const firstFieldError = Object.values(responseError)[0];

    if (
      Array.isArray(firstFieldError) &&
      typeof firstFieldError[0] === "string"
    ) {
      return firstFieldError[0];
    }
  }

  return fallbackMessage;
}
