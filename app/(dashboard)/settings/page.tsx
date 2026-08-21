"use client";
import { useState } from "react";
import { Save, Lock, User } from "lucide-react";

export default function SettingsPage() {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const showToast = (msg:string,type:"ok"|"err"="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  async function changePassword(e:React.FormEvent) {
    e.preventDefault();
    if(pwForm.next !== pwForm.confirm){ showToast("Passwords don't match","err"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/session",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:pwForm.current,newPassword:pwForm.next})});
    const data = await res.json();
    if(data.success){ showToast("✓ Password changed"); setPwForm({current:"",next:"",confirm:""}); }
    else showToast(data.message||"Failed","err");
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up
          ${toast.type==="ok"?"bg-green/10 border border-green/20 text-green":"bg-red/10 border border-red/20 text-red"}`}>
          {toast.msg}
        </div>
      )}

      <div><h1 className="font-display text-2xl font-700 text-white">Settings</h1><p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p></div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple/20 flex items-center justify-center"><Lock className="w-4 h-4 text-purple-light"/></div>
          <div><h2 className="font-display font-600 text-white text-sm">Change Password</h2><p className="text-slate-400 text-xs">Update your admin password</p></div>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" className="input" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} required/></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} required minLength={8}/></div>
          <div><label className="label">Confirm New Password</label><input type="password" className="input" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} required/></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            {loading?"Saving…":"Save Password"}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue/20 flex items-center justify-center"><User className="w-4 h-4 text-blue"/></div>
          <div><h2 className="font-display font-600 text-white text-sm">API Integration</h2><p className="text-slate-400 text-xs">Your Android app endpoint</p></div>
        </div>
        <div className="bg-black/30 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-medium">Verification Endpoint</p>
          <code className="font-mono text-sm text-cyan">POST /api/connect</code>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <p>Body: <code className="text-white/70 font-mono">{"{ key, deviceId, deviceName, appVersion }"}</code></p>
            <p>On success: <code className="text-green font-mono">{"{ success: true, status: \"active\", expiresAt }"}</code></p>
            <p>On failure: <code className="text-red font-mono">{"{ success: false, message: \"...\" }"}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
