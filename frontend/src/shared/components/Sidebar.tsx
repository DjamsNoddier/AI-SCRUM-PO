import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard,
  LogOut,
  Sparkles,
  NotepadText,
  Folders
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  closeSidebar: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  const handleLinkClick = () => {
    closeSidebar();
  };

  return (
    <div className="
      h-full flex flex-col px-5 py-8 
      bg-black/40 backdrop-blur-2xl 
      border-r border-white/10 
      shadow-[0_0_40px_rgba(0,0,0,0.4)]
    ">

      {/* LOGO ZONE */}
      <a
        href="/"
        className="hidden lg:flex flex-col items-start mb-10 group transition"
      >
        <div className="
          flex items-center gap-3 
          rounded-xl bg-white/10 ring-1 ring-white/10 
          px-3 py-2 shadow-lg
        ">
          <div className="
            flex h-9 w-9 items-center justify-center 
            rounded-xl bg-white/5 ring-1 ring-white/15
          ">
            <span className="text-lg font-semibold text-fuchsia-300">M</span>
          </div>

          <span className="font-semibold text-slate-100 tracking-tight">
            Mindloop
          </span>
        </div>

        {/* Badge Beta */}
        <span className="
          mt-2 ml-1
          rounded-full px-2 py-[2px]
          text-[10px] font-medium 
          bg-fuchsia-500/20 text-fuchsia-200 
          ring-1 ring-fuchsia-400/30
        ">
          Beta
        </span>
      </a>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        <SidebarLink 
          onClick={handleLinkClick} 
          to="/app/dashboard"
          icon={<LayoutDashboard size={16} />} 
          label="Dashboard" 
        />

        <SidebarLink 
          onClick={handleLinkClick} 
          to="/app/projects"
          icon={<Folders size={16} />} 
          label="Mes projets" 
        />

        <SidebarLink 
          onClick={handleLinkClick} 
          to="/app/meetings"
          icon={<NotepadText size={16} />} 
          label="Mes meetings" 
        />

        <SidebarLink 
          onClick={handleLinkClick} 
          to="/story-builder"
          icon={<Sparkles size={16} />} 
          label="PM Copilot" 
        />
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="
          flex items-center gap-3 px-4 py-2 mt-4 
          text-red-400 hover:text-red-300 hover:bg-white/5 
          rounded-lg transition font-medium text-sm
        "
      >
        <LogOut size={16} /> Déconnexion
      </button>
    </div>
  );
}

/* --- SidebarLink --- */
function SidebarLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }: { isActive: boolean }) =>
        `
        flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
        ${
          isActive
            ? "bg-gradient-to-r from-fuchsia-500/20 via-sky-500/20 to-emerald-400/20 text-white ring-1 ring-white/10"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }
        `
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
