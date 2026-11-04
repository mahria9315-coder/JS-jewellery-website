import { notFound } from "next/navigation";

/**
 * Rewrite target for Proxy when a request must return a real 404 status.
 * Under Cache Components, notFound() can run after streaming has started, so
 * an unknown product slug would otherwise render the 404 UI with HTTP 200.
 * This route is never linked and always resolves through the not-found
 * boundary, keeping the public URL unchanged after the Proxy rewrite.
 */
export default function NotFoundRoute() {
  notFound();
}
