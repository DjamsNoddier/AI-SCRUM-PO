// src/shared/components/sidebar/SidebarSection.tsx

export default function SidebarSection({
    title,
    collapsed,
    children
  }: {
    title: string;
    collapsed: boolean;
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-1">
        {!collapsed && (
          <p className="text-[11px] uppercase tracking-wider text-slate-500 px-2 mb-1">
            {title}
          </p>
        )}
  
        {children}
      </div>
    );
  }
  