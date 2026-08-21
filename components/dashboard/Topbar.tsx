"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";

interface Props { admin: { username: string; email: string } }

export default function Topbar({ admin }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="w-10 lg:w-0" /> {/* Spacer for mobile menu btn */}
      <div className="flex-1" />

      {/* Admin menu */}
      <div className="relative">
        <button onClick={() => setOpen(p => !p)}
          className="flex items-center gap-2 glass rounded-xl px-3 py-2 hover:bg-white/5 transition-all">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple to-blue flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">{admin.username}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-border z-20 overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-white">{admin.username}</p>
                <p className="text-xs text-slate-500 truncate">{admin.email}</p>
              </div>
              <button onClick={logout} disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red hover:bg-red/10 transition-all">
                <LogOut className="w-4 h-4" />
                {loading ? "Logging out…" : "Log out"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
