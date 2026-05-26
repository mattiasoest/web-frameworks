import { ApiError } from "../api/client";

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (typeof err.body === "object" && err.body !== null && "details" in err.body) {
      const details = (err.body as { details?: { field: string; message: string }[] }).details;
      if (details?.length) {
        return details.map((d) => `${d.field}: ${d.message}`).join("; ");
      }
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Unknown error";
}
