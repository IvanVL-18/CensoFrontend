import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar2";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

export default function DashboardLayout() {
  const [open, setOpen] = useState<boolean>(() => {
    const s = localStorage.getItem("sidebar_open");
    return s ? JSON.parse(s) : true;
  });
  useEffect(() => { localStorage.setItem("sidebar_open", JSON.stringify(open)); }, [open]);

  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#F7F3E8] text-neutral-800 flex print:bg-white">
      {/* Al imprimir (o guardar como PDF) solo sale el contenido de la página. */}
      <div className="contents print:hidden">
        <Sidebar open={open} onToggle={() => setOpen(o => !o)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="contents print:hidden">
          <TopBar />
        </div>
        <main className="flex-1 px-5 pt-5 pb-6 print:p-0">
          <div className="mb-4 print:hidden">
            <Breadcrumbs pathname={location.pathname}/>
          </div>
          <Outlet />
        </main>
        <div className="contents print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
