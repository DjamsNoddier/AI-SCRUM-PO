import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/utils";

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  danger?: boolean;
};

export default function SidebarLink({
  to,
  icon,
  label,
  collapsed,
  danger = false,
}: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group flex items-center rounded-xl transition-all duration-200",
          "hover:bg-white/5",
          isActive && !collapsed && "bg-white/10",
          danger && "text-red-400 hover:text-red-300"
        )
      }
      style={{ padding: collapsed ? "0.5rem" : "0.5rem 0.75rem" }}
    >
      {/* ICON — FIXED BOX */}
      <div
        className="
          h-10 w-10 flex items-center justify-center
          rounded-xl bg-black/40 border border-white/10
          shrink-0
        "
      >
        {icon}
      </div>

      {/* LABEL (NE PREND PAS DE PLACE COLLAPSED) */}
      <span
        className={cn(
          "text-sm text-slate-200 font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-3"
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}
