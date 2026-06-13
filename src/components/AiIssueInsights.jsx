import AiModeratorBadges from "./AiModeratorBadges";

export default function AiIssueInsights({ issue, compact = false }) {
  const hasIntel =
    issue?.isLikelySpam ||
    issue?.aiSummary ||
    issue?.aiCategory ||
    issue?.aiPriority;

  if (!hasIntel) return null;

  const wrapper = compact
    ? "rounded-xl border border-slate-200 bg-slate-50 p-3"
    : "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200";

  return (
    <section className={wrapper}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">AI triage</p>
      <AiModeratorBadges issue={issue} showSummary />
    </section>
  );
}
