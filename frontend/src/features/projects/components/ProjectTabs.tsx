// src/features/projects/components/ProjectTabs.tsx

import { cn } from "../../../lib/utils";

export type ProjectTabId = "overview" | "meetings" | "documents" | "brain";

const tabs: { id: ProjectTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "brain", label: "Brain" },
  { id: "meetings", label: "Meetings" },
  { id: "documents", label: "Documents" },
];

type ProjectTabsProps = {
  active?: ProjectTabId;
  onChange?: (tabId: ProjectTabId) => void;
};

export default function ProjectTabs({
  active = "overview",
  onChange,
}: ProjectTabsProps) {
  return (
    <div className="w-full mt-4">
      <div
        className="
          flex gap-2 rounded-2xl border border-white/10 
          bg-gradient-to-b from-white/10 to-white/5 
          backdrop-blur-xl
          px-2 py-1
          shadow-[0_0_25px_rgba(15,23,42,0.45)]
        "
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              className={cn(
                `
                flex-1 
                rounded-xl 
                px-4 py-2 
                text-center 
                text-[12px] 
                font-semibold 
                tracking-wider 
                uppercase

                /* FIX: Anti flicker */
                transition-[background-color,box-shadow,color] 
                duration-150 
                will-change-[background-color,box-shadow]
                `,
                isActive
                  ? `
                    text-white 
                    bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/20 to-cyan-500/20
                    shadow-[0_0_15px_rgba(99,102,241,0.25)] 
                    border border-white/10 
                    backdrop-blur-md
                    `
                  : `
                    text-slate-400 
                    hover:text-slate-200 
                    hover:bg-white/10 
                    hover:shadow-[0_0_12px_rgba(255,255,255,0.12)]
                  `
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
