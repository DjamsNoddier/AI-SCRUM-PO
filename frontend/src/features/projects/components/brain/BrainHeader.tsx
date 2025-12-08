// src/features/projects/components/tabs/brain/brain/BrainHeader.tsx

import { Brain, Activity } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ProjectBrainData } from "../../api/projectBrainService";

export default function BrainHeader({ data }: { data: ProjectBrainData }) {
  const updatedDate = new Date(data.updatedAt);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Icone cerveau améliorée */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/40">
          <Brain className="h-8 w-8 text-fuchsia-300" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-50">Project Brain</h2>
            <Badge className="bg-fuchsia-500/90 text-white text-xs px-2 py-0.5">
              AI Insights
            </Badge>
          </div>

          <p className="text-sm text-slate-400">
            {data.projectName} • Updated{" "}
            {updatedDate.toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Activity className="h-5 w-5 text-emerald-400" />
        Real-time monitoring enabled
      </div>
    </div>
  );
}
