import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../shared/components/Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-black text-white relative">

      {/* --- BURGER BUTTON (mobile only) --- */}
      <button
        onClick={openSidebar}
        className="lg:hidden absolute top-4 left-4 z-40 p-2 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
      >
        <Menu size={20} />
      </button>

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed inset-0 
            bg-black/50 
            backdrop-blur-sm 
            z-30
          "
        />
      )}

      {/* --- SIDEBAR (mobile + desktop) --- */}
      <div
        className={`
          fixed lg:static 
          top-0 left-0 
          h-full 
          w-72 
          z-40 
          transform transition-transform duration-300 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* On passe ici la fonction pour fermer */}
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 min-h-screen px-4 lg:px-10 py-10 overflow-x-hidden">
        <Outlet />
      </main>

      {/* --- CLOSE BUTTON inside sidebar (mobile only) --- */}
      {isSidebarOpen && (
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
