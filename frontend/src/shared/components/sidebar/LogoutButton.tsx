import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { cn } from "../../../lib/utils";

type Props = {
  collapsed: boolean;
};

export default function LogoutButton({ collapsed }: Props) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully 👋");
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
        "text-red-400 hover:text-red-300 hover:bg-red-500/10",
        collapsed && "justify-center"
      )}
    >
      <LogOut size={18} />

      {!collapsed && (
        <span className="whitespace-nowrap">Logout</span>
      )}
    </button>
  );
}
