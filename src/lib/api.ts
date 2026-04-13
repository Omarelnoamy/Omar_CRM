import axios from "axios";

/**
 * Always same-origin `/api` so the browser hits the correct Next route handlers
 * whether you open the app on `localhost:3000` or an ngrok URL.
 *
 * `NEXT_PUBLIC_API_URL` is only for server-side absolute URLs (e.g. QStash callback in
 * `src/lib/qstash.ts`), not for this client.
 */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
