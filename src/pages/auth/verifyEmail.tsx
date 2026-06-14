import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import logoImage from "../../assets/logo-stacklink.png";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Check your inbox and open the verification link.");
  const [verified, setVerified] = useState(false);
  const processedToken = useRef("");

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (!token || processedToken.current === token) return;
    processedToken.current = token;
    setStatus("Verifying your email...");
    void authService.verifyEmail(token).then(() => {
      setVerified(true);
      setStatus("Email verified successfully. You can now sign in.");
    }).catch((error) => setStatus((error as Error).message || "Unable to verify email."));
  }, [searchParams]);

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fbfbfb] px-4 py-8">
      <img src={logoImage} alt="StackLink" className="mb-6 h-14 w-14 rounded-2xl object-contain" />
      <div className="w-full max-w-[420px] rounded-[28px] border border-gray-100 bg-white p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <h1 className="text-3xl font-semibold text-[#10233c]">Verify your email</h1>
        <p className={`mt-4 text-sm ${verified ? "text-emerald-600" : "text-[#5c6f86]"}`}>{status}</p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#2388ff] to-[#1ed4c9] px-6 py-3 text-sm font-semibold text-white">Go to login</Link>
      </div>
    </section>
  );
};

export default VerifyEmail;
