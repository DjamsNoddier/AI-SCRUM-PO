// src/features/projects/components/tabs/brain/brain/ActivityTimelineCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Activity, Brain, FileText, AlertTriangle } from "lucide-react";
import type { BrainActivityItem } from "../../api/projectBrainService";
import { motion } from "framer-motion";
import type { JSX } from "react";

interface Props {
  activity: BrainActivityItem[];
}

export default function ActivityTimelineCard({ activity }: Props) {
  // Tri du plus récent au plus ancien
  const sorted = [...activity].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );

  const icons: Record<BrainActivityItem["type"], JSX.Element> = {
    MEETING: <Activity className="h-4 w-4 text-emerald-300" />,
    DOCUMENT: <FileText className="h-4 w-4 text-sky-300" />,
    INSIGHT: <Brain className="h-4 w-4 text-fuchsia-300" />,
    RISK: <AlertTriangle className="h-4 w-4 text-amber-300" />,
    DECISION: <FileText className="h-4 w-4 text-violet-300" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Activity className="h-5 w-5 text-emerald-300" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-6">

        {/* Grande ligne verticale animée */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 0.5, height: "100%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-4 top-0 w-px bg-slate-700"
        />

        {sorted.map((item: BrainActivityItem, i: number) => {
          const date = new Date(item.occurred_at);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <div className="relative flex gap-4 pl-10 group">

                {/* Point animé (pop + glow) */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-3 top-1"
                >
                  <div
                    className="
                      h-2.5 w-2.5 rounded-full bg-fuchsia-400
                      shadow-lg shadow-fuchsia-500/20 
                      transition-all duration-300
                      group-hover:scale-125 
                      group-hover:bg-fuchsia-300
                      group-hover:shadow-fuchsia-500/40
                    "
                  />
                </motion.div>

                {/* ⚠️ Ligne locale SUPPRIMÉE */}
                {/* (On garde seulement la grande ligne principale) */}

                {/* Contenu */}
                <div className="flex-1">
                  {/* Type + date */}
                  <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    {icons[item.type]}
                    <span className="text-slate-300 font-medium">{item.type}</span>

                    <span className="text-slate-500 ml-2">
                      {date.toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })}
                      {" — "}
                      {date.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-1 text-[15px] font-semibold text-slate-100">
                    {item.title}
                  </p>

                  {item.summary && (
                    <p className="text-[14px] text-slate-400">{item.summary}</p>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
