import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getProductBySlug } from "@/lib/catalogue";
import { getCollection } from "@/lib/collections";

const productPathPattern = /^\/products\/([^/]+)\/?$/;
const collectionPathPattern = /^\/collections\/([^/]+)\/?$/;

/**
 * Cache Components can start streaming before notFound() runs, which produces
 * a soft 404 (200 status) for unknown slugs. Proxy runs before the response is
 * rendered, so it can return a real 404 for product or collection slugs that
 * are not in the catalogue. The rewrite keeps the requested URL while
 * rendering the shared branded 404 page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const productMatch = productPathPattern.exec(pathname);
  const collectionMatch = collectionPathPattern.exec(pathname);

  if (!productMatch && !collectionMatch) {
    return NextResponse.next();
  }

  let slug: string;

  try {
    slug = decodeURIComponent((productMatch ?? collectionMatch)![1]);
  } catch {
    return respondNotFound(request);
  }

  const exists = productMatch
    ? Boolean(getProductBySlug(slug))
    : Boolean(getCollection(slug));

  if (exists) {
    return NextResponse.next();
  }

  return respondNotFound(request);
}

function respondNotFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/not-found";
  url.search = "";

  return NextResponse.rewrite(url, {
    status: 404,
    headers: { "X-Robots-Tag": "noindex" },
  });
}

export const config = {
  matcher: ["/products/:path*", "/collections/:path*"],
};
