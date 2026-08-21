"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { router.push("/overview"); router.refresh(); }
      else setError(data.message || "Invalid credentials.");
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue/5 blur-[120px]" />
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(1px 1px at 50% 50%,rgba(255,255,255,0.02) 0%,transparent 100%)"}} />
      </div>

      <div className="relative w-full max-w-[400px] animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple to-blue mb-4 shadow-glow-md">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-700 text-white">GFX License Control</h1>
          <p className="text-slate-400 text-sm mt-1">Secure License Management</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="bg-red/10 border border-red/20 text-red text-sm rounded-lg px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="label">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="input pl-9"
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  autoFocus required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="input pl-9 pr-10"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 relative overflow-hidden">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </span>
              ) : "Enter Panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Secure License Management · GFX Control
        </p>
      </div>
    </main>
  );
}
