// src/features/dashboard/components/TodayActionItems.tsx
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { ActionItem } from "../types/dashboard";

type Props = {
  items: ActionItem[];
};

export default function TodayActionItems({ items }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        Today
      </p>
      <h2 className="text-sm font-semibold text-slate-50">
        Your action items
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">
          No pending actions. You're all caught up ✨
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, idx) => {
            const { icon, label } = mapActionItemToUI(item);

            return (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl bg-black/40 px-4 py-2 text-[13px]"
              >
                {icon}
                <span className="text-slate-200">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function mapActionItemToUI(item: ActionItem) {
  switch (item.kind) {
    case "decisions":
      return {
        label: `${item.count} decisions to review`,
        icon: <CheckCircle2 size={14} className="text-emerald-300" />,
      };

    case "risks":
      return {
        label: `${item.count} risks flagged`,
        icon: <AlertTriangle size={14} className="text-amber-300" />,
      };

    case "userStories":
      return {
        label: `${item.count} user stories generated`,
        icon: <ArrowRight size={14} className="text-sky-300" />,
      };

    default:
      return {
        label: `${item.count} items`,
        icon: <ArrowRight size={14} className="text-slate-300" />,
      };
  }
}
