import React, { useEffect, useState } from "react";
import { profileService } from "../services/profileService";

const inputClass = "mt-2 w-full rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none focus:border-primary";

const PublishingSettings: React.FC = () => {
  const [form, setForm] = useState({ seoTitle: "", seoDescription: "", socialImage: "", customDomain: "", googleAnalyticsId: "", metaPixelId: "", tiktokPixelId: "" });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <section className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <form className="mx-auto max-w-3xl space-y-5" onSubmit={(event) => { event.preventDefault(); setSaving(true); setStatus(""); void profileService.updatePublishing(form).then(() => setStatus("Publishing settings saved.")).catch((error) => setStatus((error as Error).message)).finally(() => setSaving(false)); }}>
        <header><h1 className="text-3xl font-semibold text-on-surface">Publishing</h1><p className="mt-2 text-on-surface-variant">Control search previews, custom domain, and marketing pixels.</p></header>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">SEO & social preview</h2><div className="mt-4 space-y-4">
            {field("seoTitle", "SEO title", "Creator name | StackLink")}
            <label className="block text-sm font-medium">SEO description<textarea value={form.seoDescription} maxLength={160} onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))} className={`${inputClass} min-h-24`} /></label>
            {field("socialImage", "Social image URL", "https://...")}
          </div>
        </article>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Custom domain</h2><p className="mt-2 text-sm text-on-surface-variant">Point a CNAME record to your deployed frontend, then enter the hostname below.</p><div className="mt-4">{field("customDomain", "Domain", "links.example.com")}</div>
        </article>
        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Tracking pixels</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("googleAnalyticsId", "Google Analytics ID", "G-XXXXXXXXXX")}{field("metaPixelId", "Meta Pixel ID", "123456789")}{field("tiktokPixelId", "TikTok Pixel ID", "CXXXXXXXX")}
          </div>
        </article>
        {status && <p className="rounded-xl bg-surface-container p-3 text-sm font-medium">{status}</p>}
        <button disabled={saving} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-on disabled:opacity-60">{saving ? "Saving..." : "Save publishing settings"}</button>
      </form>
    </section>
  );
};

export default PublishingSettings;
