import { Notice } from "@/components/ui/FormPrimitives";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export function firstParam(
  params: AdminSearchParams,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Render the success/error notice carried in the URL after a redirect. */
export function AdminQueryNotice({ params }: { params: AdminSearchParams }) {
  const error = firstParam(params, "error");
  const notice = firstParam(params, "notice");

  if (error) {
    return <Notice tone="error">{error}</Notice>;
  }

  if (notice) {
    return <Notice tone="success">{notice}</Notice>;
  }

  return null;
}
