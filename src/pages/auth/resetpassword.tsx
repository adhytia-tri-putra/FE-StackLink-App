import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockIcon, ArrowRightIcon } from "../../components/Icons";
import { authInputClass, authLabelClass } from "./authStyles";
import logoImage from "../../assets/logo-stacklink.png";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#fbfbfb] px-4 py-8 font-sans">
      <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#d7e8fb]">
        <img src={logoImage} alt="StackLink logo" className="h-full w-full object-contain" />
      </div>

      <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-[#10233c]">
        StackLink
      </h1>
      <p className="mb-8 text-center text-sm text-[#5c6f86]">
        Secure your sanctuary. Enter your new password below.
      </p>

      <div className="w-full max-w-[420px] rounded-[28px] border border-gray-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className={authLabelClass}>New Password</label>
            <div className="relative">
              <LockIcon />
              <input
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className={authInputClass}
                required
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              Minimum 8 characters with a mix of letters and symbols.
            </p>
          </div>

          <div>
            <label className={authLabelClass}>Confirm New Password</label>
            <div className="relative">
              <LockIcon />
              <input
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95"
          >
            Update Password <ArrowRightIcon />
          </button>
        </form>

        <div className="my-6 h-px w-full bg-gray-100" />

        <div className="space-y-3 text-center">
          <Link to="/login" className="block text-sm font-medium text-[#2388ff] hover:underline">
            Back to login
          </Link>
          <p className="text-sm text-gray-500">
            Having trouble?{" "}
            <a href="#" className="font-medium text-[#2388ff] hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-gray-400">
        © 2024 StackLink. Protected by industry-standard encryption.
      </p>
    </section>
  );
};

export default ResetPassword;
