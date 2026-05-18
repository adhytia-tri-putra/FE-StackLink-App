import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkService } from "../services/linkService";

const AddLink: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!title.trim() || !url.trim()) {
        setError("Judul dan URL diperlukan");
        setLoading(false);
        return;
      }

      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      
      await linkService.createLink(
        title,
        fullUrl,
        description || null
      );

      alert("Link berhasil ditambahkan!");
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

            <label className="block">
              <span className="text-[15px] font-semibold text-on-surface">URL *</span>
              <input
                type="text"
                inputMode="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
                required
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
