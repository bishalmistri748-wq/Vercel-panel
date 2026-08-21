// Devices Page
"use client";
import { useEffect, useState } from "react";
import { Smartphone, Unlink, Shield, RefreshCw } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type Device = {
  id: string; licenseId: string; deviceId: string; deviceName?: string;
  appVersion?: string; firstSeen: string; lastSeen: string; lastIp?: string;
  blocked: boolean; license: { key: string; status: string };
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{id:string;action:"unbind"|"block"}|null>(null);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/devices");
    const data = await res.json();
    if (data.success) setDevices(data.devices);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  async function doAction() {
    if (!confirm) return;
    const { id, action } = confirm; setConfirm(null);
    const res = await fetch(`/api/devices/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) { showToast(`✓ Device ${action === "unbind" ? "unbound" : "blocked"}`); load(); }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium bg-green/10 border border-green/20 text-green animate-slide-up">{toast}</div>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
            <h3 className="font-display font-600 text-white mb-2">Confirm Action</h3>
            <p className="text-slate-400 text-sm mb-6">
              {confirm.action === "unbind" ? "This will unbind the device from its license. The user will need to re-verify." : "This will block the device from verifying any license."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1 border border-border">Cancel</button>
              <button onClick={doAction} className="btn-danger flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-700 text-white">Devices</h1><p className="text-slate-400 text-sm mt-1">{devices.length} registered devices</p></div>
        <button onClick={load} className="btn-ghost border border-border flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Device","License Key","App Version","First Seen","Last Seen","IP","Status","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? Array(5).fill(0).map((_,i)=>(
                <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="skeleton h-4 rounded w-full"/></td></tr>
              )) : devices.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-500">No devices registered yet</td></tr>
              ) : devices.map(d => (
                <tr key={d.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><Smartphone className="w-3.5 h-3.5 text-slate-400"/></div>
                      <div>
                        <p className="text-white text-xs font-medium">{d.deviceName||"Unknown"}</p>
                        <code className="text-slate-500 text-[10px] font-mono">{d.deviceId.slice(0,16)}…</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><code className="font-mono text-xs text-white/80">{d.license.key}</code></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{d.appVersion||"—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{format(new Date(d.firstSeen),"MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDistanceToNow(new Date(d.lastSeen),{addSuffix:true})}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{d.lastIp||"—"}</td>
                  <td className="px-4 py-3">
                    <span className={d.blocked ? "badge-revoked" : "badge-active"}>{d.blocked?"BLOCKED":"ACTIVE"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setConfirm({id:d.id,action:"unbind"})} title="Unbind"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue hover:bg-blue/10 transition-all"><Unlink className="w-3.5 h-3.5"/></button>
                      <button onClick={() => setConfirm({id:d.id,action:"block"})} title="Block"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red hover:bg-red/10 transition-all"><Shield className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
