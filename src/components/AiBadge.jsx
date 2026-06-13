import { Sparkles } from "lucide-react";

export default function AiBadge({ title = "AI-assisted suggestions available", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-violet-100 text-violet-800 border border-violet-200/80 ${className}`}
      title={title}
    >
      <Sparkles className="w-3 h-3" aria-hidden />
      AI
    </span>
  );
}
