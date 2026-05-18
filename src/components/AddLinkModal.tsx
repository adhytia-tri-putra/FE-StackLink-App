import React, { useEffect, useState } from "react";
import { linkService, LinkItem } from "../services/linkService";

type IconProps = React.SVGProps<SVGSVGElement>;

type AddLinkModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (link: LinkItem) => void;
};

const IconPlus = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
  </svg>
);

const IconClose = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const normalizeUrl = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

const AddLinkModal: React.FC<AddLinkModalProps> = ({ open, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setUrl("");
      setError("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required.");
      return;
    }

    setSaving(true);

    try {
      const created = await linkService.createLink(title.trim(), normalizeUrl(url.trim()), null);
      onCreated(created);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to create link.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-on-surface/35 p-4 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close modal" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[520px] rounded-[24px] border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-soft-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-primary">
              <IconPlus />
            </span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-on-surface">Add New Link</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Add a destination to your public profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
            title="Close"
          >
            <IconClose />
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-on-surface">Title</span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: YouTube"
              className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-on-surface">URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              inputMode="url"
              className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full bg-surface-container px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-on transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Link"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLinkModal;
