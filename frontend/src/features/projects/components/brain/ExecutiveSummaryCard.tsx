// src/features/projects/components/tabs/brain/brain/ExecutiveSummaryCard.tsx

import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export default function ExecutiveSummaryCard({ summary }: { summary: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          Executive Summary
          <Badge className="border border-indigo-400/60 text-indigo-200 text-[13px]">
            AI Generated
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-[15px] leading-relaxed text-slate-200">{summary}</p>
      </CardContent>
    </Card>
  );
}
