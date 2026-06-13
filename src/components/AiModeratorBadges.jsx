import { getCategoryLabel } from "../constants/issues";
import { formatSpamScore, normalizeSpamScore, PRIORITY_LABELS } from "../utils/aiDisplay";

export default function AiModeratorBadges({ issue, showSummary = true, className = "" }) {
  if (!issue) return null;

  const hasIntel =
    issue.isLikelySpam ||
    issue.aiSummary ||
    issue.aiCategory ||
    issue.aiPriority ||
    (issue.spamScore != null && normalizeSpamScore(issue.spamScore) > 0);

  if (!hasIntel) return null;

  const score = formatSpamScore(issue.spamScore);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-1.5">
        {issue.isLikelySpam && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-600 text-white"
            title={issue.spamReason || "Flagged as likely spam"}
          >
            AI: Spam Likely 🚨
          </span>
        )}
        {(issue.spamScore > 0 || issue.isLikelySpam) && (
          <span
            className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200"
            title={issue.spamReason || undefined}
          >
            AI Score: {score}
          </span>
        )}
        {issue.aiCategory && !issue.isLikelySpam && (
          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-900 border border-violet-200">
            AI Category: {getCategoryLabel(issue.aiCategory)}
          </span>
        )}
        {issue.aiPriority && !issue.isLikelySpam && (
          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 capitalize">
            AI Priority: {PRIORITY_LABELS[issue.aiPriority] || issue.aiPriority}
          </span>
        )}
      </div>
      {showSummary && issue.aiSummary && !issue.isLikelySpam && (
        <p className="text-xs text-slate-600 leading-snug border-l-2 border-violet-300 pl-2">
          {issue.aiSummary}
        </p>
      )}
    </div>
  );
}
