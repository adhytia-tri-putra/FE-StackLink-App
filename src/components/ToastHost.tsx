import React, { useEffect, useState } from "react";

type Toast = { id: number; message: string };

const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      const toast = { id: Date.now() + Math.random(), message: String(message || "Done") };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), 3500);
    };
    return () => { window.alert = originalAlert; };
  }, []);

  return <div className="fixed right-4 top-4 z-[100] space-y-2">{toasts.map((toast) => <div key={toast.id} role="status" className="max-w-sm rounded-2xl bg-[#10233c] px-4 py-3 text-sm font-medium text-white shadow-xl">{toast.message}</div>)}</div>;
};

export default ToastHost;
