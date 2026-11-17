import type { Metadata } from "next";

import { panelClass } from "@/components/ui/FormPrimitives";
import { listRecentAuditLogs } from "@/lib/admin/audit";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Audit log",
  description: "Private administrator audit trail.",
  path: "/admin/audit",
  noIndex: true,
});

export default async function AdminAuditPage() {
  await requireAdminPage("audit.view");
  const logs = await listRecentAuditLogs(200);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-editorial heading-champagne text-2xl">
          Audit log
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-champagne/70">
          Sensitive administrator actions are recorded here. Passwords, session
          secrets, payment account numbers, and supplier documents are never
          written to this log.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">No admin actions recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-champagne/70">
                <th scope="col" className="py-2 pr-4 font-semibold">When</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Actor</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Action</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Entity</th>
                <th scope="col" className="py-2 font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 text-champagne/70">
                    {new Date(log.createdAt).toLocaleString("en-PK")}
                  </td>
                  <td className="py-3 pr-4 text-white">{log.actor}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-champagne">
                    {log.action}
                  </td>
                  <td className="py-3 pr-4 text-champagne">
                    {log.entityType}
                    <span className="block font-mono text-xs text-champagne/60">
                      {log.entityId}
                    </span>
                  </td>
                  <td className="py-3 text-champagne">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
