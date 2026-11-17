import { headers } from "next/headers";

import { isSameOriginRequestHeaders } from "@/lib/security/request";

/**
 * Server-action origin check.
 *
 * Next.js compares Origin/Host for Server Actions already. This helper adds an
 * explicit, testable check to the authentication, setup, MFA, and profile
 * actions so a future transport change cannot silently remove that protection.
 */
export async function isSameOriginAction(): Promise<boolean> {
  const headerStore = await headers();

  return isSameOriginRequestHeaders((name) => headerStore.get(name));
}
