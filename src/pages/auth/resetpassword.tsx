import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LockIcon, ArrowRightIcon } from "../../components/Icons";
import { authService } from "../../services/authService";
import { authInputClass, authLabelClass } from "./authStyles";
import logoImage from "../../assets/logo-stacklink.png";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = searchParams.get("token") || "";
    if (!token) return setStatus("Reset token is missing. Request a new reset link.");
    if (password.length < 8) return setStatus("Password must contain at least 8 characters.");
    if (password !== confirmPassword) return setStatus("Password confirmation does not match.");

    setSubmitting(true);
    setStatus("");
    try {
      await authService.resetPassword(token, password);
      navigate("/login", { replace: true, state: { message: "Password updated. Please sign in." } });
    } catch (error) {
      setStatus((error as Error).message || "Unable to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#fbfbfb] px-4 py-8 font-sans">
      <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#d7e8fb]">
        <img src={logoImage} alt="StackLink logo" className="h-full w-full object-contain" />
      </div>
      <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-[#10233c]">StackLink</h1>
      <p className="mb-8 text-center text-sm text-[#5c6f86]">Enter and confirm your new password below.</p>

      <div className="w-full max-w-[420px] rounded-[28px] border border-gray-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <div>
            <label className={authLabelClass}>New Password</label>
            <div className="relative">
              <LockIcon />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className={authInputClass} required />
            </div>
          </div>
          <div>
            <label className={authLabelClass}>Confirm New Password</label>
            <div className="relative">
              <LockIcon />
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your new password" className={authInputClass} required />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60">
            {submitting ? "Updating..." : "Update Password"} <ArrowRightIcon />
          </button>
          {status && <p className="text-center text-sm text-red-600">{status}</p>}
        </form>
        <div className="my-6 h-px w-full bg-gray-100" />
        <Link to="/login" className="block text-center text-sm font-medium text-[#2388ff] hover:underline">Back to login</Link>
      </div>
      <p className="mt-12 text-center text-xs text-gray-400">&copy; 2026 StackLink. Protected by industry-standard encryption.</p>
    </section>
  );
};

export default ResetPassword;
