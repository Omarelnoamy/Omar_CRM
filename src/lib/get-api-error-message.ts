import axios from "axios";

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data.trim().slice(0, 800);
  }

  if (data && typeof data === "object") {
    const topMessage = data.message;
    if (typeof topMessage === "string" && topMessage.trim()) {
      return topMessage.trim();
    }

    const responseError = data.error;

    if (typeof responseError === "string") {
      return responseError;
    }

    if (responseError && typeof responseError === "object") {
      if (
        "message" in responseError &&
        typeof responseError.message === "string"
      ) {
        return responseError.message;
      }

      const firstFieldError = Object.values(responseError)[0];

      if (
        Array.isArray(firstFieldError) &&
        typeof firstFieldError[0] === "string"
      ) {
        return firstFieldError[0];
      }
    }
  }

  return fallbackMessage;
}
