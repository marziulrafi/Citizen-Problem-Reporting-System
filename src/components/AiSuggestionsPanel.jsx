import { AlertTriangle, Loader2 } from "lucide-react";
import { getCategoryLabel } from "../constants/issues";
import { formatSpamScore, PRIORITY_LABELS } from "../utils/aiDisplay";

export default function AiSuggestionsPanel({
  analysis,
  loading,
  error,
  onApplyCategory,
  onApplyPriority,
  showApply = true,
}) {
  if (!loading && !analysis && !error) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2 text-xs">
      {loading && (
        <p className="flex items-center gap-1.5 text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Analyzing…
        </p>
      )}
      {error && <p className="text-amber-800">{error}</p>}

      {analysis && !loading && (
        <>
          {analysis.isLikelySpam ? (
            <p className="flex items-center gap-1 text-red-800 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Spam likely · {formatSpamScore(analysis.spamScore)}
            </p>
          ) : (
            <>
              {analysis.aiSummary && (
                <p className="text-slate-700 leading-snug italic border-l-2 border-violet-300 pl-2">
                  {analysis.aiSummary}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {analysis.aiCategory && (
                  <SuggestChip
                    label={`Category: ${getCategoryLabel(analysis.aiCategory)}`}
                    onApply={showApply && onApplyCategory ? () => onApplyCategory(analysis.aiCategory) : null}
                  />
                )}
                {analysis.aiPriority && (
                  <SuggestChip
                    label={`Priority: ${PRIORITY_LABELS[analysis.aiPriority] || analysis.aiPriority}`}
                    onApply={showApply && onApplyPriority ? () => onApplyPriority(analysis.aiPriority) : null}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SuggestChip({ label, onApply }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 text-violet-900 font-medium">
      {label}
      {onApply && (
        <button type="button" onClick={onApply} className="underline font-bold">
          Use
        </button>
      )}
    </span>
  );
}
