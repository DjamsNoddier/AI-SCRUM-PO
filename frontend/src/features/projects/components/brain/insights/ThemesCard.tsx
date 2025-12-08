// src/features/projects/components/tabs/brain/brain/ThemesCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Activity } from "lucide-react";
import type { BrainTheme } from "../../../api/projectBrainService";

interface Props {
  themes: BrainTheme[];
}

export default function ThemesCard({ themes }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-violet-300" />
          Dominant Themes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {themes.map((t: BrainTheme, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[15px] text-slate-200">
              <span>{t.name}</span>
              <span>{Math.round(t.weight)}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400"
                style={{ width: `${t.weight}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
