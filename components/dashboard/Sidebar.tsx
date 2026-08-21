"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Key, PlusSquare, Smartphone, ScrollText,
  BarChart2, Settings, Zap, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/overview",  label: "Overview",    icon: LayoutDashboard },
  { href: "/licenses",  label: "Licenses",    icon: Key },
  { href: "/generate",  label: "Generate",    icon: PlusSquare },
  { href: "/devices",   label: "Devices",     icon: Smartphone },
  { href: "/logs",      label: "Verify Logs", icon: ScrollText },
  { href: "/analytics", label: "Analytics",   icon: BarChart2 },
  { href: "/settings",  label: "Settings",    icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${active ? "active" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-purple-light" : "text-slate-500 group-hover:text-slate-300"}`} />
            {label}
            {active && <ChevronRight className="ml-auto w-3 h-3 text-purple-light" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(p => !p)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center glass rounded-xl">
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      {/* Sidebar — desktop always visible, mobile drawer */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-[240px] flex flex-col
        bg-surface border-r border-border
        transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-blue flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-600 text-white leading-none">GFX Panel</p>
            <p className="text-[10px] text-slate-500 mt-0.5">License Control</p>
          </div>
        </div>

        <NavLinks />

        {/* Bottom version badge */}
        <div className="px-4 py-3 border-t border-border">
          <div className="glass rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-500 font-mono">v1.0.0 · Production</p>
          </div>
        </div>
      </aside>
    </>
  );
}
