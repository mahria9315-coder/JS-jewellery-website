import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCollection } from "@/lib/collections";
import { isPublishedProductSlug } from "@/lib/storefront/products";

const productPathPattern = /^\/products\/([^/]+)\/?$/;
const collectionPathPattern = /^\/collections\/([^/]+)\/?$/;

/**
 * Cache Components can start streaming before notFound() runs, which produces
 * a soft 404 (200 status) for unknown slugs. Proxy resolves existence before
 * the route renders: collection slugs are a fixed approved set, and product
 * slugs are checked against published database rows. Unknown slugs get a hard
 * 404 rewrite with an explicit noindex header.
 */
export async function proxy(request: NextRequest) {
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

  if (productMatch) {
    return (await isPublishedProductSlug(slug))
      ? NextResponse.next()
      : respondNotFound(request);
  }

  return getCollection(slug) ? NextResponse.next() : respondNotFound(request);
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
