import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search projects or meetings…"
        className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2
                   text-sm text-slate-200 placeholder:text-slate-500
                   backdrop-blur-xl focus:outline-none focus:border-sky-400/40
                   transition"
      />
    </div>
  );
}
