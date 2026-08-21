"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Copy, RotateCcw, Trash2, Check, Filter, RefreshCw } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type License = {
  id: string; key: string; status: string; durationDays: number; maxDevices: number;
  note?: string; createdAt: string; activatedAt?: string; expiresAt?: string; revokedAt?: string;
  _count: { devices: number };
};

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "badge-active", EXPIRED: "badge-expired",
  REVOKED: "badge-revoked", INACTIVE: "badge-inactive", EXPIRING: "badge-expiring",
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "revoke" | "delete" | "reset" } | null>(null);
  const [page, setPage] = useState(1);
  const PER = 15;

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/licenses");
    const data = await res.json();
    if (data.success) setLicenses(data.licenses);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resolveStatus(l: License) {
    if (l.status === "REVOKED") return "REVOKED";
    if (!l.activatedAt) return "INACTIVE";
    if (l.expiresAt && new Date(l.expiresAt) < new Date()) return "EXPIRED";
    if (l.expiresAt) {
      const days = (new Date(l.expiresAt).getTime() - Date.now()) / 86400000;
      if (days <= 3) return "EXPIRING";
    }
    return "ACTIVE";
  }

  const filtered = licenses
    .filter(l => filter === "ALL" || resolveStatus(l) === filter)
    .filter(l => !search || l.key.toLowerCase().includes(search.toLowerCase()) || l.note?.toLowerCase().includes(search.toLowerCase()));

  const paginated = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);

  async function copy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
    showToast("✓ License key copied");
  }

  async function doAction() {
    if (!confirm) return;
    const { id, action } = confirm; setConfirm(null);
    const endpoints: Record<string, string> = {
      revoke: `/api/licenses/${id}/revoke`,
      delete: `/api/licenses/${id}`,
      reset: `/api/licenses/${id}/reset-device`,
    };
    const methods: Record<string, string> = { delete: "DELETE", revoke: "POST", reset: "POST" };
    const res = await fetch(endpoints[action], { method: methods[action] });
    const data = await res.json();
    if (data.success) { showToast(`✓ ${action.charAt(0).toUpperCase() + action.slice(1)} successful`); load(); }
    else showToast(data.message || "Action failed", "err");
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up
          ${toast.type === "ok" ? "bg-green/10 border border-green/20 text-green" : "bg-red/10 border border-red/20 text-red"}`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
            <h3 className="font-display font-600 text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 text-sm mb-6">
              {confirm.action === "revoke" && "This will revoke the license. Users will immediately lose access."}
              {confirm.action === "delete" && "This will permanently delete the license and all associated data."}
              {confirm.action === "reset" && "This will unbind the device from this license."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1 border border-border">Cancel</button>
              <button onClick={doAction} className="btn-danger flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-white">Licenses</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} keys</p>
        </div>
        <button onClick={load} className="btn-ghost border border-border flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search by key or note…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          {["ALL","ACTIVE","INACTIVE","EXPIRING","EXPIRED","REVOKED"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border
                ${filter === f ? "bg-purple/20 border-purple/40 text-purple-light" : "border-border text-slate-400 hover:border-slate-500"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["License Key","Status","Devices","Duration","Created","Expires","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-4">
                  <div className="skeleton h-4 rounded w-full" />
                </td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">No licenses found</td></tr>
              ) : paginated.map(l => {
                const st = resolveStatus(l);
                return (
                  <tr key={l.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-white/90">{l.key}</code>
                        <button onClick={() => copy(l.key)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                          {copied === l.key ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {l.note && <p className="text-slate-500 text-[10px] mt-0.5">{l.note}</p>}
                    </td>
                    <td className="px-4 py-3"><span className={STATUS_MAP[st] || "badge-inactive"}>{st}</span></td>
                    <td className="px-4 py-3 text-slate-400">{l._count.devices}/{l.maxDevices}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{l.durationDays >= 36500 ? "Lifetime" : `${l.durationDays}d`}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {format(new Date(l.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {l.expiresAt
                        ? <span className={new Date(l.expiresAt) < new Date() ? "text-red" : "text-slate-400"}>
                            {formatDistanceToNow(new Date(l.expiresAt), { addSuffix: true })}
                          </span>
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {l._count.devices > 0 && (
                          <button onClick={() => setConfirm({ id: l.id, action: "reset" })}
                            title="Unbind device"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue hover:bg-blue/10 transition-all">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {l.status !== "REVOKED" && (
                          <button onClick={() => setConfirm({ id: l.id, action: "revoke" })}
                            title="Revoke"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-yellow hover:bg-yellow/10 transition-all">
                            <span className="text-xs font-mono">✕</span>
                          </button>
                        )}
                        <button onClick={() => setConfirm({ id: l.id, action: "delete" })}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red hover:bg-red/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-border text-slate-400 disabled:opacity-40 hover:bg-white/5 transition-all">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-border text-slate-400 disabled:opacity-40 hover:bg-white/5 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
