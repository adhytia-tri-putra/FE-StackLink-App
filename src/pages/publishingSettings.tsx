import React, { useEffect, useState } from "react";
import { profileService } from "../services/profileService";

const inputClass = "mt-2 w-full rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none focus:border-primary";

const PublishingSettings: React.FC = () => {
  const [form, setForm] = useState({ seoTitle: "", seoDescription: "", socialImage: "", customDomain: "", googleAnalyticsId: "", metaPixelId: "", tiktokPixelId: "" });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    void profileService.getMyProfile().then((profile) => setForm({
      seoTitle: profile.seoTitle || "", seoDescription: profile.seoDescription || "", socialImage: profile.socialImage || "",
      customDomain: profile.customDomain || "", googleAnalyticsId: profile.googleAnalyticsId || "",
      metaPixelId: profile.metaPixelId || "", tiktokPixelId: profile.tiktokPixelId || "",
    })).catch((error) => setStatus((error as Error).message));
  }, []);

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <label className="block text-sm font-medium text-on-surface">{label}<input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} className={inputClass} /></label>
  );

  const runDiagnostics = () => {
    setStatus("Checking DNS and tracking IDs...");
    void profileService.getPublishingDiagnostics().then((data) => { setDiagnostics(data); setStatus("Diagnostics completed."); }).catch((error) => setStatus((error as Error).message));
  };

  return (
    <section className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <form className="mx-auto max-w-3xl space-y-5" onSubmit={(event) => { event.preventDefault(); setSaving(true); setStatus(""); void profileService.updatePublishing(form).then(() => setStatus("Publishing settings saved.")).catch((error) => setStatus((error as Error).message)).finally(() => setSaving(false)); }}>
        <header><h1 className="text-3xl font-semibold text-on-surface">Publishing</h1><p className="mt-2 text-on-surface-variant">Control search previews, custom domain, and marketing pixels.</p></header>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">SEO & social preview</h2><div className="mt-4 space-y-4">
            {field("seoTitle", "SEO title", "Creator name | StackLink")}
            <label className="block text-sm font-medium">SEO description<textarea value={form.seoDescription} maxLength={160} onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))} className={`${inputClass} min-h-24`} /></label>
            {field("socialImage", "Social image URL", "https://...")}
            <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white"><div className="aspect-[1.91/1] bg-surface-container bg-cover bg-center" style={{ backgroundImage: form.socialImage ? `url(${form.socialImage})` : undefined }} /><div className="p-4"><p className="text-xs uppercase text-on-surface-variant">StackLink preview</p><p className="mt-1 font-semibold">{form.seoTitle || "Your profile title"}</p><p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{form.seoDescription || "Your public profile description will appear here."}</p></div></div>
          </div>
        </article>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Custom domain</h2><p className="mt-2 text-sm text-on-surface-variant">Point a CNAME record to your deployed frontend, then enter the hostname below.</p><div className="mt-4">{field("customDomain", "Domain", "links.example.com")}</div>
          {diagnostics?.domain && <div className={`mt-4 rounded-xl p-3 text-sm ${diagnostics.domain.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{diagnostics.domain.verified ? "DNS verified" : `DNS pending. Expected: ${diagnostics.domain.expectedTarget || "any resolvable record"}`}{diagnostics.domain.records?.length ? `; found: ${diagnostics.domain.records.join(", ")}` : ""}</div>}
        </article>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Tracking pixels</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("googleAnalyticsId", "Google Analytics ID", "G-XXXXXXXXXX")}{field("metaPixelId", "Meta Pixel ID", "123456789")}{field("tiktokPixelId", "TikTok Pixel ID", "CXXXXXXXX")}
          </div>
          {diagnostics?.pixels && <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">{Object.entries(diagnostics.pixels).map(([name, value]: [string, any]) => <span key={name} className={`rounded-xl p-3 ${value.configured && value.valid ? "bg-emerald-50 text-emerald-700" : "bg-surface-container text-on-surface-variant"}`}>{name}: {value.configured ? value.valid ? "ready" : "invalid" : "not configured"}</span>)}</div>}
        </article>
        {diagnostics?.production && <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Production readiness</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Configuration status only. Secret values are never returned to the browser.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(diagnostics.production.checks).map(([name, configured]) => <span key={name} className={`rounded-xl p-3 text-sm font-medium ${configured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{name}: {configured ? "configured" : "missing"}</span>)}
          </div>
        </article>}
        {status && <p className="rounded-xl bg-surface-container p-3 text-sm font-medium">{status}</p>}
        <div className="flex flex-wrap gap-3"><button disabled={saving} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-on disabled:opacity-60">{saving ? "Saving..." : "Save publishing settings"}</button><button type="button" onClick={runDiagnostics} className="rounded-full border border-primary px-6 py-3 font-semibold text-primary">Run diagnostics</button></div>
      </form>
    </section>
  );
};

export default PublishingSettings;
