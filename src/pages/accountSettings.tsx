import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";

const inputClass = "mt-2 w-full rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none focus:border-primary";

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void profileService.getMyProfile().then((profile) => {
      setEmail(profile.email || "");
      setUsername(profile.username);
    }).catch((error) => setStatus((error as Error).message));
  }, []);

  const run = async (action: () => Promise<unknown>, success: string, logout = false) => {
    setBusy(true);
    setStatus("");
    try {
      await action();
      setStatus(success);
      if (logout) {
        authService.clearToken();
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setStatus((error as Error).message || "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <header><h1 className="text-3xl font-semibold text-on-surface">Account Settings</h1><p className="mt-2 text-on-surface-variant">Manage your login identity and account security.</p></header>

        <form className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); void run(() => accountService.updateAccount(email, username), "Account details updated."); }}>
          <h2 className="text-xl font-semibold text-on-surface">Login identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-on-surface">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} required /></label>
            <label className="text-sm font-medium text-on-surface">Username<input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} required /></label>
          </div>
          <button disabled={busy} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-on disabled:opacity-60">Save account</button>
        </form>

        <form className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft" onSubmit={(event) => { event.preventDefault(); void run(() => accountService.changePassword(currentPassword, newPassword), "Password updated.", true); }}>
          <h2 className="text-xl font-semibold text-on-surface">Change password</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-on-surface">Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} required /></label>
            <label className="text-sm font-medium text-on-surface">New password<input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} required /></label>
          </div>
          <button disabled={busy} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-on disabled:opacity-60">Update password</button>
        </form>

        <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-on-surface">Sessions</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Sign out this account on every device, including this one.</p>
          <button disabled={busy} onClick={() => void run(accountService.logoutAll, "All sessions closed.", true)} className="mt-4 rounded-full border border-primary px-5 py-2.5 font-semibold text-primary disabled:opacity-60">Logout all devices</button>
        </article>

        <form className="rounded-[20px] border border-red-200 bg-red-50 p-5" onSubmit={(event) => { event.preventDefault(); if (window.confirm("Delete this account and all of its links permanently?")) void run(() => accountService.deleteAccount(deletePassword), "Account deleted.", true); }}>
          <h2 className="text-xl font-semibold text-red-700">Delete account</h2>
          <p className="mt-2 text-sm text-red-600">This permanently deletes your profile, links, clicks, and sessions.</p>
          <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} placeholder="Confirm with your password" className={inputClass} required />
          <button disabled={busy} className="mt-4 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">Delete account</button>
        </form>
        {status && <p className="rounded-xl bg-surface-container p-3 text-sm font-medium text-on-surface">{status}</p>}
      </div>
    </section>
  );
};

export default AccountSettings;
