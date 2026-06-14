import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { MailIcon, LockIcon, EyeIcon, ArrowRightIcon } from "../../components/Icons";
import { authInputClass, authLabelClass } from "./authStyles";
import logoImage from "../../assets/logo-stacklink.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate("/dashboard");
    } catch (error) {
      alert((error as Error).message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fbfbfb] px-4 py-8 font-sans">
      {/* Icon Logo */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#d7e8fb]">
        <img src={logoImage} alt="StackLink logo" className="h-full w-full object-contain" />
      </div>

      <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-[#10233c]">
        StackLink
      </h1>
      <p className="mb-8 text-center text-sm text-[#5c6f86]">
        Welcome back to your digital sanctuary.
        <br /> Enter your details to continue.
      </p>

      <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100">
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className={authLabelClass}>Email</label>
            <div className="relative">
              <MailIcon />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@example.com"
                className={authInputClass}
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={authLabelClass}>Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-[#2388ff] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <LockIcon />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={authInputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7290b6] hover:text-[#2388ff]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-70">
            {loading ? "Signing In..." : "Sign In"}
            <ArrowRightIcon />
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-[#5c6f86]">
        Don't have an account? <Link to="/register" className="font-semibold text-[#2388ff] hover:underline">Sign up</Link>
      </p>

      <div className="mt-12 flex gap-6 text-xs text-gray-400">
        <Link to="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-gray-600">Terms of Service</Link>
        <Link to="/help" className="hover:text-gray-600">Help Center</Link>
      </div>
    </section>
  );
};

export default Login;
