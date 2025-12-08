// src/features/projects/components/DocumentsPanel.tsx

import type { ProjectDocument } from "../../api/projectService";

type Props = { documents: ProjectDocument[] };

export default function DocumentsPanel({ documents }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl">
      <h2 className="text-sm font-semibold text-slate-100">Project documents</h2>

      {documents.length === 0 ? (
        <p className="mt-3 text-[12px] text-slate-500">
          Attach documents so Mindloop can link discussions with artifacts.
        </p>
      ) : (
        <ul className="mt-4 space-y-2 text-[12px]">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex justify-between px-3 py-2.5 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="truncate text-slate-100">{d.name}</span>
              <a className="text-sky-300 hover:underline" href={d.url} target="_blank">
                Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
