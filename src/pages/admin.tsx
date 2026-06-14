import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const load = () => void adminService.overview().then(setData).catch((reason) => setError((reason as Error).message));
  useEffect(load, []);
  const updateUser = async (id: number, payload: { plan?: string; suspended?: boolean }) => { await adminService.updateUser(id, payload); load(); };
  const resolve = async (id: string) => { await adminService.resolveReport(id); load(); };

  return <section className="min-h-screen bg-surface px-4 py-6 sm:px-6"><div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-semibold">Admin dashboard</h1>
    {error && <p className="mt-4 rounded-xl bg-error/10 p-4 text-error">{error}</p>}
    {data && <><div className="mt-6 grid gap-4 sm:grid-cols-3">{Object.entries(data.totals).map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-soft"><p className="text-sm text-on-surface-variant">{label}</p><p className="mt-2 text-3xl font-semibold">{String(value)}</p></div>)}</div>
    <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-4 shadow-soft"><h2 className="mb-4 text-xl font-semibold">Users</h2><table className="w-full text-left text-sm"><thead><tr><th className="p-2">User</th><th>Plan</th><th>Links</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.users.map((user: any) => <tr key={user.id} className="border-t"><td className="p-2"><strong>{user.name}</strong><br/><span className="text-on-surface-variant">@{user.username}</span></td><td>{user.plan}</td><td>{user._count.links}</td><td>{user.suspendedAt ? "Suspended" : "Active"}</td><td className="space-x-2"><button onClick={() => updateUser(user.id, { plan: user.plan === "PRO" ? "FREE" : "PRO" })} className="rounded-full border px-3 py-1">Toggle plan</button><button onClick={() => updateUser(user.id, { suspended: !user.suspendedAt })} className="rounded-full border px-3 py-1">{user.suspendedAt ? "Restore" : "Suspend"}</button></td></tr>)}</tbody></table></div>
    <div className="mt-6 rounded-2xl bg-white p-4 shadow-soft"><h2 className="mb-4 text-xl font-semibold">Abuse reports</h2>{data.reports.length === 0 ? <p className="text-on-surface-variant">No reports.</p> : data.reports.map((report: any) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 border-t py-3"><div><strong>@{report.user.username}: {report.reason}</strong><p className="text-sm text-on-surface-variant">{report.details || "No details"} · {report.status}</p></div>{report.status === "OPEN" && <button onClick={() => resolve(report.id)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-on">Resolve</button>}</div>)}</div></>}
  </div></section>;
}
