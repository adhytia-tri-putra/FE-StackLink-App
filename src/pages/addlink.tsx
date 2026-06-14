import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkService } from "../services/linkService";

const AddLink: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [error, setError] = useState("");
  const [blockType, setBlockType] = useState("LINK");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const urlOptional = ["HEADING", "DIVIDER"].includes(blockType);
      if (!title.trim() || (!urlOptional && !url.trim())) {
        setError("Judul dan URL diperlukan");
        setLoading(false);
        return;
      }

      const fullUrl = new URL(urlOptional ? "https://stacklink.local/" : url.startsWith("http") ? url : `https://${url}`);
      if (utmSource) fullUrl.searchParams.set("utm_source", utmSource);
      if (utmMedium) fullUrl.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) fullUrl.searchParams.set("utm_campaign", utmCampaign);
      
      await linkService.createLink(
        title,
        fullUrl.toString(),
        description || null,
        { startsAt: startsAt ? new Date(startsAt).toISOString() : null, endsAt: endsAt ? new Date(endsAt).toISOString() : null },
        { blockType, description: description || null }
      );

      navigate("/links");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menambahkan link";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-surface px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
      <div className="w-full max-w-[760px]">
        <header className="mb-6">
          <h1 className="text-[30px] font-semibold leading-tight text-on-surface sm:text-[36px] xl:text-[40px]">
            Add New Link
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Add a destination that will appear on your public profile.
          </p>
        </header>

        <div className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-soft sm:p-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-error/20 bg-error/10 p-4">
                <p className="text-sm font-medium text-error">{error}</p>
              </div>
            )}

            <label className="block"><span className="text-[15px] font-semibold text-on-surface">Content type</span><select value={blockType} onChange={(event) => setBlockType(event.target.value)} className="mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3"><option value="LINK">Link button</option><option value="YOUTUBE">YouTube embed</option><option value="SPOTIFY">Spotify embed</option><option value="SOCIAL">Social profile</option><option value="HEADING">Heading</option><option value="DIVIDER">Divider</option><option value="CONTACT">Contact</option><option value="DONATION">Donation</option></select></label>

            <label className="block">
              <span className="text-[15px] font-semibold text-on-surface">Title *</span>
              <input
                type="text"
                placeholder="Example: Portfolio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="text-[15px] font-semibold text-on-surface">Starts at</span><input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3" /></label>
              <label className="block"><span className="text-[15px] font-semibold text-on-surface">Ends at</span><input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3" /></label>
            </div>

            <fieldset className="rounded-2xl border border-outline-variant/60 p-4"><legend className="px-2 text-sm font-semibold">UTM builder</legend><div className="grid gap-3 sm:grid-cols-3">
              <input value={utmSource} onChange={(event) => setUtmSource(event.target.value)} placeholder="Source" className="rounded-xl bg-surface-container-low px-3 py-2.5" />
              <input value={utmMedium} onChange={(event) => setUtmMedium(event.target.value)} placeholder="Medium" className="rounded-xl bg-surface-container-low px-3 py-2.5" />
              <input value={utmCampaign} onChange={(event) => setUtmCampaign(event.target.value)} placeholder="Campaign" className="rounded-xl bg-surface-container-low px-3 py-2.5" />
            </div></fieldset>

            <label className={`block ${["HEADING", "DIVIDER"].includes(blockType) ? "hidden" : ""}`}>
              <span className="text-[15px] font-semibold text-on-surface">URL *</span>
              <input
                type="text"
                inputMode="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
                required={!(["HEADING", "DIVIDER"].includes(blockType))}
              />
            </label>

            <label className="block">
              <span className="text-[15px] font-semibold text-on-surface">Description</span>
              <textarea
                rows={4}
                placeholder="Optional short note for this link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base leading-relaxed text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
              />
            </label>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/links")}
                className="rounded-full bg-surface-container px-6 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-on transition-opacity hover:opacity-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddLink;
