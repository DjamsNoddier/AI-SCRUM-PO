import { useState } from "react";
import SidebarLink from "./SidebarLink";
import { LayoutDashboard, Folders, NotepadText } from "lucide-react";
import LogoutButton from "./LogoutButton";

type Props = {
  collapsed: boolean;
  toggleCollapse: () => void;
};

export default function Sidebar({ collapsed, toggleCollapse }: Props) {
  const [hoverLogo, setHoverLogo] = useState(false);

  return (
    <div
      className={`
        h-full fixed top-0 left-0
        bg-black/40 backdrop-blur-2xl border-r border-white/10
        flex flex-col justify-between
        transition-all duration-300
        ${collapsed ? "w-[80px]" : "w-[240px]"}
      `}
    >
      {/* TOP ZONE */}
      <div className="flex flex-col items-center gap-6 pt-6">

        {/* LOGO M (HOVER → SHOW COLLAPSE BUTTON) */}
        <div
          onMouseEnter={() => setHoverLogo(true)}
          onMouseLeave={() => setHoverLogo(false)}
          className="relative"
        >
          {/* M ICON */}
          {/* LOGO M */}
          <div
            className={`
              h-10 w-10 rounded-xl border border-white/10
              flex items-center justify-center
              text-fuchsia-300 font-bold text-lg
              bg-black/30 transition-all duration-200
              ${hoverLogo ? "opacity-0" : "opacity-100"}
              hover:bg-gradient-to-br
              hover:from-fuchsia-500/20
              hover:via-sky-400/20
              hover:to-emerald-400/20
              hover:shadow-[0_0_25px_rgba(205,100,255,0.25)]
            `}
          >
            M
          </div>


          {/* HOVER BUTTON (like ChatGPT) */}
          <button
            onClick={toggleCollapse}
            className={`
              absolute inset-0
              h-10 w-10 rounded-xl
              flex items-center justify-center
              text-fuchsia-300 border border-fuchsia-300/40
              bg-black/40 backdrop-blur-xl
              transition-all duration-200
              ${hoverLogo ? "opacity-100" : "opacity-0 pointer-events-none"}
              hover:shadow-[0_0_35px_rgba(205,100,255,0.35)]
              hover:bg-gradient-to-br
              hover:from-fuchsia-500/20
              hover:via-sky-400/20
              hover:to-emerald-400/20
            `}
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col gap-3 w-full px-3">
          <SidebarLink
            to="/app/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            collapsed={collapsed}
          />

          <SidebarLink
            to="/app/projects"
            icon={<Folders size={20} />}
            label="Mes projets"
            collapsed={collapsed}
          />

          <SidebarLink
            to="/app/meetings"
            icon={<NotepadText size={20} />}
            label="Mes meetings"
            collapsed={collapsed}
          />
        </div>
      </div>

      {/* BOTTOM ZONE */}
      <LogoutButton collapsed={collapsed} />

    </div>
  );
}
