"use client";
import { useState } from "react";
import { Zap, Copy, Check, Download, X } from "lucide-react";

const DURATIONS = [
  { label: "1 Day", days: 1 }, { label: "3 Days", days: 3 }, { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 }, { label: "90 Days", days: 90 }, { label: "180 Days", days: 180 },
  { label: "365 Days", days: 365 }, { label: "Lifetime", days: 36500 },
];

export default function GeneratePage() {
  const [form, setForm] = useState({ durationDays: 30, maxDevices: 1, quantity: 1, note: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/licenses/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.keys);
      else setError(data.message || "Failed to generate");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  async function copy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    if (!result) return;
    navigator.clipboard.writeText(result.join("\n"));
    setCopied("ALL"); setTimeout(() => setCopied(null), 1500);
  }

  function downloadCSV() {
    if (!result) return;
    const csv = "License Key,Duration,Max Devices\n" +
      result.map(k => `${k},${form.durationDays}d,${form.maxDevices}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "gfx-licenses.csv"; a.click();
  }

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-cyan flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-600 text-white">Licenses Generated</h2>
                  <p className="text-slate-400 text-xs">{result.length} key{result.length > 1 ? "s" : ""} ready</p>
                </div>
              </div>
              <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-5">
              {result.map(k => (
                <div key={k} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 group">
                  <code className="font-mono text-sm text-white/90 tracking-wider">{k}</code>
                  <button onClick={() => copy(k)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white ml-3">
                    {copied === k ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={copyAll} className="btn-ghost flex-1 border border-border flex items-center justify-center gap-2 text-sm">
                {copied === "ALL" ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
                {copied === "ALL" ? "Copied!" : "Copy All"}
              </button>
              <button onClick={downloadCSV} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-700 text-white">Generate Licenses</h1>
        <p className="text-slate-400 text-sm mt-1">Create new license keys for your customers</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        {error && <div className="bg-red/10 border border-red/20 text-red text-sm rounded-lg px-4 py-3">{error}</div>}

        {/* Duration */}
        <div>
          <label className="label">Duration</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DURATIONS.map(({ label, days }) => (
              <button key={days} onClick={() => setForm(p => ({ ...p, durationDays: days }))}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all
                  ${form.durationDays === days
                    ? "bg-purple/20 border-purple/40 text-purple-light"
                    : "border-border text-slate-400 hover:border-slate-500 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Devices */}
        <div>
          <label className="label">Max Devices</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setForm(p => ({ ...p, maxDevices: n }))}
                className={`w-14 py-2.5 rounded-xl text-sm font-medium border transition-all
                  ${form.maxDevices === n ? "bg-purple/20 border-purple/40 text-purple-light" : "border-border text-slate-400 hover:border-slate-500"}`}>
                {n}
              </button>
            ))}
            <input type="number" min={1} max={10} placeholder="Custom"
              className="input w-24"
              onChange={e => setForm(p => ({ ...p, maxDevices: Number(e.target.value) || 1 }))} />
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="label">Quantity</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
              className="w-10 h-10 glass-hover rounded-xl flex items-center justify-center text-slate-400 hover:text-white">−</button>
            <span className="font-display text-2xl font-700 text-white w-12 text-center">{form.quantity}</span>
            <button onClick={() => setForm(p => ({ ...p, quantity: Math.min(50, p.quantity + 1) }))}
              className="w-10 h-10 glass-hover rounded-xl flex items-center justify-center text-slate-400 hover:text-white">+</button>
            <span className="text-slate-500 text-sm ml-2">max 50</span>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="label">Note <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
          <input className="input" placeholder="e.g. Order #1234, Customer name…"
            value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
        </div>

        <button onClick={generate} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
          ) : (
            <><Zap className="w-4 h-4" /> Generate {form.quantity} License{form.quantity > 1 ? "s" : ""}</>
          )}
        </button>
      </div>
    </div>
  );
}
