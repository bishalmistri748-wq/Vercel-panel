import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar admin={admin} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
