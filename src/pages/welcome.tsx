import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon } from "../components/Icons";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";

const inputClass = "w-full rounded-xl border border-[#cadcf2] bg-white px-4 py-3 text-sm text-[#16304f] placeholder:text-[#90a5bf] focus:border-[#2388ff] focus:outline-none focus:ring-2 focus:ring-[#47bfff]/30";

const readFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("Unable to read the selected image."));
  reader.readAsDataURL(file);
});

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    void profileService.getMyProfile().then((profile) => {
      setName(profile.name || "");
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatarUrl || null);
    }).catch((error) => setStatus((error as Error).message));
  }, [navigate]);

  const handleAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|gif)$/) || file.size > 5 * 1024 * 1024) {
      setStatus("Use a JPG, PNG, or GIF image under 5MB.");
      return;
    }
    try {
      setAvatar(await readFile(file));
      setStatus("");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await profileService.updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        avatar,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus((error as Error).message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[760px] flex-col justify-center py-1 sm:min-h-[calc(100vh-4rem)] sm:py-2">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-[#10233c] sm:text-4xl">Welcome to StackLink</h1>
      <p className="mt-2 text-center text-base text-[#5c6f86] sm:text-xl">Let&apos;s craft your professional presence.</p>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#d7e6f7] bg-white px-6 pb-6 pt-5 shadow-[0_18px_40px_rgba(35,136,255,0.10)] sm:px-8 sm:pb-7">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2388ff] via-[#47bfff] to-[#1ed4c9]" />
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="flex flex-col items-center">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif" onChange={handleAvatar} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#b8d8ff] bg-[#eef7ff] transition hover:bg-[#e1f1ff] sm:h-28 sm:w-28">
              {avatar ? <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" /> : <><CameraIcon /><span className="text-base font-medium text-[#5c87b3]">Upload</span></>}
            </button>
            <p className="mt-2 text-center text-sm text-[#5c6f86]">JPG, PNG, or GIF under 5MB.</p>
          </div>

          <div className="h-px bg-[#e3edf8]" />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">Display Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} type="text" placeholder="e.g. Alex Morgan" className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">Headline</span>
            <input value={headline} onChange={(event) => setHeadline(event.target.value)} type="text" maxLength={100} placeholder="e.g. Creative Director & Strategist" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">Short Bio</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} maxLength={150} placeholder="Tell your audience what you do..." className={`${inputClass} resize-none`} />
          </label>
          {status && <p className="text-sm font-medium text-red-600">{status}</p>}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => navigate("/dashboard", { replace: true })} className="h-12 rounded-xl border border-[#cadcf2] bg-white px-6 text-sm font-semibold text-[#2388ff] transition hover:bg-[#eef7ff] sm:text-base">Skip for now</button>
            <button type="submit" disabled={saving} className="h-12 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(35,136,255,0.28)] transition hover:opacity-95 disabled:opacity-60 sm:text-base">{saving ? "Saving..." : "Save & Continue"}</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Welcome;
