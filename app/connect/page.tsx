"use client";
import { useState } from "react";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";

type State = "idle"|"checking"|"success"|"error";

export default function ConnectPage() {
  const [key, setKey] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState<string|null>(null);

  async function verify() {
    if(!key.trim()) return;
    setState("checking");
    try {
      const res = await fetch("/api/connect",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ key:key.trim(), deviceId:"web-preview", deviceName:"Web Browser", appVersion:"web" }),
      });
      const data = await res.json();
      if(data.success){ setState("success"); setExpiresAt(data.expiresAt); }
      else { setState("error"); setMessage(data.message||"License invalid"); }
    } catch { setState("error"); setMessage("Network error. Try again."); }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-purple/5 blur-[120px]"/>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue/5 blur-[100px]"/>
      </div>

      <div className="relative w-full max-w-[420px] animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple to-blue mb-4 shadow-glow-md">
            <Zap className="w-8 h-8 text-white"/>
          </div>
          <h1 className="font-display text-2xl font-700 text-white">GFX Panel</h1>
          <p className="text-slate-400 text-sm mt-1">License Activation</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {state === "success" ? (
            <div className="text-center animate-fade-in">
              <CheckCircle className="w-12 h-12 text-green mx-auto mb-4"/>
              <h2 className="font-display text-lg font-600 text-white mb-1">License Verified</h2>
              <p className="text-slate-400 text-sm">Your license is active and valid.</p>
              {expiresAt && <p className="text-slate-500 text-xs mt-3">Expires: {new Date(expiresAt).toLocaleDateString()}</p>}
              <button onClick={()=>{setState("idle");setKey("");}} className="btn-ghost mt-6 text-sm">Check another key</button>
            </div>
          ) : state === "error" ? (
            <div className="text-center animate-fade-in">
              <XCircle className="w-12 h-12 text-red mx-auto mb-4"/>
              <h2 className="font-display text-lg font-600 text-white mb-1">Verification Failed</h2>
              <p className="text-slate-400 text-sm">{message}</p>
              <button onClick={()=>setState("idle")} className="btn-ghost mt-6 text-sm">Try again</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">Enter License Key</label>
                <input className="input font-mono tracking-widest text-center" placeholder="GFX-XXXX-XXXX-XXXX"
                  value={key} onChange={e=>setKey(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==="Enter"&&verify()}/>
              </div>
              <button onClick={verify} disabled={state==="checking"||!key.trim()} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {state==="checking"?<><Loader2 className="w-4 h-4 animate-spin"/>Checking license…</>:<><Zap className="w-4 h-4"/>Verify License</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
