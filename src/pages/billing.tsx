import { useEffect, useState } from "react";
import { billingService, type BillingStatus } from "../services/billingService";

export default function Billing() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { void billingService.getStatus().then(setStatus).catch((error) => setMessage((error as Error).message)); }, []);

  const upgrade = async () => {
    try { window.location.assign(await billingService.checkout()); }
    catch (error) { setMessage((error as Error).message); }
  };

  return <section className="min-h-screen bg-surface px-4 py-6 sm:px-6"><div className="mx-auto max-w-4xl">
    <h1 className="text-3xl font-semibold text-on-surface">Plans & billing</h1>
    <p className="mt-2 text-on-surface-variant">Manage link limits and your StackLink plan.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <article className={`rounded-3xl border p-6 ${status?.plan === "FREE" ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}><h2 className="text-2xl font-semibold">Free</h2><p className="mt-2 text-on-surface-variant">Up to {status?.usage.limit ?? 5} links and core analytics.</p><p className="mt-6 font-semibold">{status?.usage.links ?? 0} links used</p></article>
      <article className={`rounded-3xl border p-6 ${status?.plan === "PRO" ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}><h2 className="text-2xl font-semibold">Pro</h2><p className="mt-2 text-on-surface-variant">Unlimited links, publishing tools, and advanced analytics.</p>{status?.plan === "PRO" ? <p className="mt-6 font-semibold text-emerald-700">Active</p> : <button type="button" disabled={!status?.checkoutConfigured} onClick={upgrade} className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-on disabled:opacity-50">Upgrade to Pro</button>}</article>
    </div>
    {!status?.checkoutConfigured && status && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Payment provider is not configured yet. Set BILLING_CHECKOUT_URL on the server.</p>}
    {message && <p className="mt-4 rounded-xl bg-error/10 p-4 text-sm text-error">{message}</p>}
  </div></section>;
}
