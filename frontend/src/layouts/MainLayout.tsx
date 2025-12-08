import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/sidebar/Sidebar";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div className="w-full h-screen flex bg-black text-slate-50 overflow-hidden">

      {/* --------------------------- SIDEBAR --------------------------- */}
      <Sidebar collapsed={collapsed} toggleCollapse={toggle} />
      {/* --------------------------- MAIN CONTENT --------------------------- */}
      <main
        className="flex-1 h-full overflow-y-auto transition-all duration-300 px-4 lg:px-10 py-8"
        style={{
          marginLeft: collapsed ? "64px" : "240px", // 👈 FIX
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
