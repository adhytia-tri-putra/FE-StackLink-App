import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { MailIcon, LockIcon, UserIcon } from "../../components/Icons";
import { authInputClass, authLabelClass } from "./authStyles";
import logoImage from "../../assets/logo-stacklink.png";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const username = name.trim().toLowerCase().replace(/\s+/g, "-");
      const result = await authService.register(username, name, email, password);
      const token = result.developmentToken ? `?token=${encodeURIComponent(result.developmentToken)}` : "";
      navigate(`/verify-email${token}`, { replace: true, state: { email } });
    } catch (error) {
      alert((error as Error).message || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fbfbfb] px-4 py-8 font-sans">
      <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#d7e8fb]">
        <img src={logoImage} alt="StackLink logo" className="h-full w-full object-contain" />
      </div>

      <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-[#10233c]">
        StackLink
      </h1>
      <p className="mb-8 text-center text-sm text-[#5c6f86]">
        Join the digital sanctuary for modern card creators.
      </p>

      <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100">
        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className={authLabelClass}>Full Name</label>
            <div className="relative">
              <UserIcon />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={authLabelClass}>Email</label>
            <div className="relative">
              <MailIcon />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="hello@example.com"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={authLabelClass}>Password</label>
            <div className="relative">
              <LockIcon />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••••••"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-300 text-[#2388ff] focus:ring-[#2388ff]" required />
            <label htmlFor="terms" className="text-xs text-gray-500">
              I agree to the <Link to="/terms" className="font-semibold text-[#2388ff]">Terms of Service</Link> and <Link to="/privacy" className="font-semibold text-[#2388ff]">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={loading} className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-70">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-[#5c6f86]">
        Already have an account? <Link to="/login" className="font-semibold text-[#2388ff] hover:underline">Log in</Link>
      </p>
    </section>
  );
};

export default Register;
