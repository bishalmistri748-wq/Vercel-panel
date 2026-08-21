"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Range = "24h"|"7d"|"30d"|"90d";

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d); setLoading(false); });
  }, [range]);

  const COLORS = ["#7C3AED","#3B82F6","#10B981","#F59E0B"];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="font-display text-2xl font-700 text-white">Analytics</h1><p className="text-slate-400 text-sm mt-1">License activity overview</p></div>
        <div className="flex gap-2 flex-wrap">
          {(["24h","7d","30d","90d"] as Range[]).map(r=>(
            <button key={r} onClick={()=>setRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${range===r?"bg-purple/20 border-purple/40 text-purple-light":"border-border text-slate-400 hover:border-slate-500"}`}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl h-56 skeleton"/>)}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-600 text-white mb-4">Verifications Over Time</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.verificationsByTime||[]}>
                <XAxis dataKey="label" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111827",border:"1px solid #1F2937",borderRadius:8,fontSize:12}}/>
                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-600 text-white mb-4">License Creations</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.creationsByTime||[]}>
                <XAxis dataKey="label" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111827",border:"1px solid #1F2937",borderRadius:8,fontSize:12}}/>
                <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-600 text-white mb-4">License Status Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={data.statusDist||[]} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                    {(data.statusDist||[]).map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {(data.statusDist||[]).map((d:any,i:number)=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:COLORS[i%COLORS.length]}}/><span className="text-slate-400 text-xs">{d.name}</span></div>
                    <span className="text-white text-xs font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-600 text-white mb-4">Success vs Failed</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.successVsFail||[]}>
                <XAxis dataKey="label" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111827",border:"1px solid #1F2937",borderRadius:8,fontSize:12}}/>
                <Bar dataKey="success" fill="#10B981" radius={[4,4,0,0]} stackId="a"/>
                <Bar dataKey="failed" fill="#EF4444" radius={[4,4,0,0]} stackId="a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : <p className="text-slate-500 text-center py-12">No data available</p>}
    </div>
  );
}
