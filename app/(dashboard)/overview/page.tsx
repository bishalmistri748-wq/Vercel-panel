import { prisma } from "@/lib/prisma";
import { Key, ShieldCheck, Clock, XCircle, Smartphone, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getStats() {
  const now = new Date();
  const [total, active, expired, revoked, devices, verifications, recent] = await Promise.all([
    prisma.license.count(),
    prisma.license.count({ where: { status: "ACTIVE", expiresAt: { gt: now } } }),
    prisma.license.count({ where: { OR: [{ status: "EXPIRED" }, { expiresAt: { lt: now } }] } }),
    prisma.license.count({ where: { status: "REVOKED" } }),
    prisma.device.count({ where: { blocked: false } }),
    prisma.verificationLog.count({ where: { createdAt: { gt: new Date(Date.now() - 86400000) } } }),
    prisma.verificationLog.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      select: { licenseKey: true, deviceName: true, success: true, reason: true, ip: true, createdAt: true },
    }),
  ]);
  return { total, active, expired, revoked, devices, verifications, recent };
}

const CARDS = [
  { key: "total",         label: "Total Licenses", icon: Key,          color: "from-purple to-blue",   shadow: "shadow-glow-sm" },
  { key: "active",        label: "Active",         icon: ShieldCheck,  color: "from-green to-cyan",    shadow: "shadow-glow-green" },
  { key: "expired",       label: "Expired",        icon: Clock,        color: "from-yellow to-red",    shadow: "" },
  { key: "revoked",       label: "Revoked",        icon: XCircle,      color: "from-red to-red/70",    shadow: "" },
  { key: "devices",       label: "Devices",        icon: Smartphone,   color: "from-blue to-cyan",     shadow: "shadow-glow-cyan" },
  { key: "verifications", label: "Checks (24h)",   icon: Activity,     color: "from-purple/80 to-purple", shadow: "" },
];

export default async function OverviewPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="font-display text-2xl font-700 text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">License system at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {CARDS.map(({ key, label, icon: Icon, color, shadow }) => (
          <div key={key} className={`glass-hover rounded-2xl p-5 ${shadow}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display text-2xl font-700 text-white">
              {stats[key as keyof typeof stats] as number}
            </p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display text-sm font-600 text-white">Recent Verifications</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.recent.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-sm">No verifications yet</div>
          )}
          {stats.recent.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-white/2 transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${log.success ? "bg-green shadow-glow-green" : "bg-red"}`} />
              <code className="font-mono text-xs text-white/80 w-36 truncate shrink-0">{log.licenseKey}</code>
              <span className="text-xs text-slate-400 flex-1 truncate">{log.deviceName || "Unknown device"}</span>
              {!log.success && <span className="text-xs text-red/80 hidden sm:block">{log.reason}</span>}
              <span className="text-xs text-slate-500 shrink-0">
                {formatDistanceToNow(log.createdAt, { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
