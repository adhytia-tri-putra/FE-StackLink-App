import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailIcon, ArrowRightIcon } from "../../components/Icons";
import { authInputClass, authLabelClass } from "./authStyles";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const handleResetRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/reset-password");
  };

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fbfbfb] px-4 py-8 font-sans">
      
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f4ff]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2388ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
      </div>

      <h1 className="mb-2 text-center font-serif text-3xl font-semibold tracking-tight text-gray-900">
        Password Recovery
      </h1>
      <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-gray-500">
        Enter the email address associated with your account to receive a secure reset link.
      </p>

      <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 z-10">
        <form className="space-y-6" onSubmit={handleResetRequest}>
          <div>
            <label className={authLabelClass}>Email Address</label>
            <div className="relative">
              <MailIcon />
              <input
                type="email"
                placeholder="name@example.com"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95">
            Send Reset Link <ArrowRightIcon />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition">
             &larr; Back to Login
          </Link>
        </div>
      </div>

    </section>
  );
};

export default ForgotPassword;
