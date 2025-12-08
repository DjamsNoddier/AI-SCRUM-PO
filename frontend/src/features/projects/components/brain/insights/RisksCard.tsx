// src/features/projects/components/tabs/brain/brain/RisksCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { AlertTriangle } from "lucide-react";
import type { BrainRisk } from "../../../api/projectBrainService";

interface Props {
  risks: BrainRisk[];
}

export default function RisksCard({ risks }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-300" />
          Top Risks
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {risks.map((risk: BrainRisk, i: number) => (
          <div key={i} className="rounded-xl bg-slate-900/70 p-4">
            <p className="text-[15px] font-semibold text-slate-100">{risk.title}</p>
            {risk.description && (
              <p className="text-[14px] text-slate-400 mt-1">{risk.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
