// src/layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../shared/components/Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Detect recording page
  const isRecordingPage = location.pathname.includes("/recording");

  return (
    <div
      className="min-h-[100dvh] lg:h-[100dvh] flex flex-col lg:flex-row bg-gray-950 text-gray-100 relative"
      // Pourquoi: hauteur réelle mobile header pour le calc côté RecordingView
      style={{ ["--mobile-header-h" as any]: "4.5rem" }}
    >
      {/* MOBILE HEADER */}
      <header className="lg:hidden w-full p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="text-2xl font-semibold flex items-center gap-2 flex-grow text-center justify-center -ml-8">
            <span className="text-blue-400">∞</span> Mindloop
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 transform
          lg:static lg:translate-x-0
          h-full border-r border-gray-800 bg-gray-900/90 backdrop-blur-xl 
          transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 overflow-y-auto bg-gray-950 lg:order-2
          ${isRecordingPage ? "pt-0" : "pt-[4.5rem] lg:pt-0"}
        `}
      >
        <div
          className={`h-full w-full 
            ${isRecordingPage ? "p-0 lg:p-0" : "p-4 lg:p-10"}
          `}
        >
          <Outlet />
        </div>
      </main>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}
    </div>
  );
}
