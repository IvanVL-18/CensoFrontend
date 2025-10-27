import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/ui/layout/Sidebar";
import TopBar from "../components/ui/layout/TopBar2";
import Breadcrumbs from "../components/ui/layout/Breadcrumbs";

export default function DashboardLayout() {
  const [open, setOpen] = useState<boolean>(() => {
    const s = localStorage.getItem("sidebar_open");
    return s ? JSON.parse(s) : true;
  });
  useEffect(() => { localStorage.setItem("sidebar_open", JSON.stringify(open)); }, [open]);

  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#F7F3E8] text-neutral-800 flex">
      <Sidebar open={open} onToggle={() => setOpen(o => !o)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="px-6 pt-20 pb-10">
          <div className="mb-4">
            <Breadcrumbs pathname={location.pathname}/>
          </div>
          <Outlet />
        </main>
        <footer className="mt-auto py-3 text-center text-xs text-neutral-600">
          © 2025 Gobierno del Estado de Hidalgo
        </footer>
      </div>
    </div>
  );
}
