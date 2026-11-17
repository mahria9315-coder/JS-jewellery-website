import type { Instrumentation } from "next";

/**
 * Server instrumentation.
 *
 * Next.js calls `onRequestError` for unhandled server errors. We emit one
 * structured JSON line that a host can collect; request headers are not
 * logged because they can contain cookies and authorisation values. No
 * external logging service is configured by default.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { logRequestError } = await import("@/lib/logging/logger");

  logRequestError(error, request, context);
};
