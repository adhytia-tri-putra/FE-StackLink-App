import React, { createContext, useContext, useRef, useState } from "react";

type ConfirmOptions = { title: string; message: string; confirmLabel?: string; danger?: boolean };
const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const confirm = (next: ConfirmOptions) => new Promise<boolean>((resolve) => { resolver.current = resolve; setOptions(next); });
  const close = (value: boolean) => { resolver.current?.(value); resolver.current = null; setOptions(null); };
  return <ConfirmContext.Provider value={confirm}>{children}{options && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"><h2 id="confirm-title" className="text-xl font-semibold text-[#10233c]">{options.title}</h2><p className="mt-3 text-sm leading-6 text-[#5c6f86]">{options.message}</p><div className="mt-6 flex justify-end gap-3"><button autoFocus onClick={() => close(false)} className="rounded-full bg-gray-100 px-5 py-2.5 font-semibold text-gray-700">Cancel</button><button onClick={() => close(true)} className={`rounded-full px-5 py-2.5 font-semibold text-white ${options.danger ? "bg-red-600" : "bg-[#2388ff]"}`}>{options.confirmLabel || "Confirm"}</button></div></div></div>}</ConfirmContext.Provider>;
};
