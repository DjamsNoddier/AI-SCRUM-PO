import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard,  
  LogOut, 
  Sparkles, 
  NotepadText,
  Folders } 
  from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Modification pour accepter une fonction de fermeture
interface SidebarProps {
    closeSidebar: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    closeSidebar(); // Ferme le menu après déconnexion sur mobile
  };
  
  // Fonction qui se déclenche après un clic sur un lien
  const handleLinkClick = () => {
    closeSidebar();
  }

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Logo - Affiché UNIQUEMENT sur Desktop (lg:block) */}
      <div className="hidden lg:flex text-2xl font-semibold mb-10 items-center gap-2">
        <span className="text-blue-400">∞</span> Mindloop
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {/* Passer la fonction de fermeture au SidebarLink */}
        <SidebarLink onClick={handleLinkClick} to="/app/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarLink onClick={handleLinkClick} to="/app/projects" icon={<Folders size={18} />} label=" Mes Projets" /> 
        <SidebarLink onClick={handleLinkClick} to="/app/meetings" icon={<NotepadText size={18} />} label="Mes meetings" />
        <SidebarLink onClick={handleLinkClick} to="/story-builder" icon={<Sparkles size={18} />} label="PM Copilot" /> 
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mt-4 text-red-400 hover:text-red-300 transition"
      >
        <LogOut size={18} /> Déconnexion
      </button>
    </div>
  );
}

// Mise à jour de la fonction SidebarLink pour accepter onClick
function SidebarLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void; // Nouvelle prop
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick} // Ajout de l'événement de clic
      className={({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
         ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}