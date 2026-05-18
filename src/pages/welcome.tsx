import React from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon } from "../components/Icons";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[760px] flex-col justify-center py-1 sm:min-h-[calc(100vh-4rem)] sm:py-2">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-[#10233c] sm:text-4xl">
        Welcome to StackLink
      </h1>
      <p className="mt-2 text-center text-base text-[#5c6f86] sm:text-xl">
        Let&apos;s craft your professional presence.
      </p>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#d7e6f7] bg-white px-6 pb-6 pt-5 shadow-[0_18px_40px_rgba(35,136,255,0.10)] sm:px-8 sm:pb-7">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2388ff] via-[#47bfff] to-[#1ed4c9]" />

        <form className="space-y-4" onSubmit={handleSave}>
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-[#b8d8ff] bg-[#eef7ff] transition hover:bg-[#e1f1ff] sm:h-28 sm:w-28">
              <CameraIcon />
              <span className="text-base font-medium text-[#5c87b3]">Upload</span>
            </div>
            <p className="mt-2 text-center text-sm text-[#5c6f86] sm:text-sm">
              Recommended size: 500x500px.
              <br />
              JPG or PNG under 5MB.
            </p>
          </div>

          <div className="h-px bg-[#e3edf8]" />

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-[#cadcf2] bg-white px-4 py-3 text-sm text-[#16304f] placeholder:text-[#90a5bf] focus:border-[#2388ff] focus:outline-none focus:ring-2 focus:ring-[#47bfff]/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">
              Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Creative Director & Strategist"
              className="w-full rounded-xl border border-[#cadcf2] bg-white px-4 py-3 text-sm text-[#16304f] placeholder:text-[#90a5bf] focus:border-[#2388ff] focus:outline-none focus:ring-2 focus:ring-[#47bfff]/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#16304f] sm:text-base">
              Short Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell your audience what you do and what drives you..."
              className="w-full resize-none rounded-xl border border-[#cadcf2] bg-white px-4 py-3 text-sm text-[#16304f] placeholder:text-[#90a5bf] focus:border-[#2388ff] focus:outline-none focus:ring-2 focus:ring-[#47bfff]/30"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-12 rounded-xl border border-[#cadcf2] bg-white px-6 text-sm font-semibold text-[#2388ff] transition hover:bg-[#eef7ff] sm:text-base">
              Skip for now
            </button>
            <button
              type="submit"
              className="h-12 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(35,136,255,0.28)] transition hover:opacity-95 sm:text-base">
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Welcome;
