"use client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

type Log = {
  id: string; licenseKey: string; deviceId?: string; deviceName?: string;
  appVersion?: string; ip?: string; success: boolean; reason?: string; createdAt: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL"|"SUCCESS"|"FAILED">("ALL");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/logs");
    const data = await res.json();
    if (data.success) setLogs(data.logs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = logs
    .filter(l => filter === "ALL" || (filter === "SUCCESS" ? l.success : !l.success))
    .filter(l => !search || l.licenseKey.toLowerCase().includes(search.toLowerCase()) || l.deviceName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-700 text-white">Verification Logs</h1><p className="text-slate-400 text-sm mt-1">{filtered.length} entries</p></div>
        <button onClick={load} className="btn-ghost border border-border flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
          <input className="input pl-9" placeholder="Search key or device…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {(["ALL","SUCCESS","FAILED"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${filter===f?"bg-purple/20 border-purple/40 text-purple-light":"border-border text-slate-400 hover:border-slate-500"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Time","License Key","Device","App Ver","IP","Result","Reason"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? Array(8).fill(0).map((_,i)=>(
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-4 rounded w-full"/></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">No logs found</td></tr>
              ) : filtered.map(l=>(
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap font-mono">{format(new Date(l.createdAt),"HH:mm:ss")}</td>
                  <td className="px-4 py-3"><code className="font-mono text-xs text-white/80">{l.licenseKey}</code></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{l.deviceName||"—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{l.appVersion||"—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{l.ip||"—"}</td>
                  <td className="px-4 py-3">
                    {l.success
                      ? <span className="flex items-center gap-1.5 text-green text-xs"><CheckCircle className="w-3.5 h-3.5"/> SUCCESS</span>
                      : <span className="flex items-center gap-1.5 text-red text-xs"><XCircle className="w-3.5 h-3.5"/> FAILED</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{l.reason||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
