/** Normalize stored spam score (supports legacy 0–100). */
export function normalizeSpamScore(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  if (n > 1) return Math.min(1, Math.round((n / 100) * 100) / 100);
  return Math.min(1, Math.max(0, n));
}

export function formatSpamScore(score) {
  return normalizeSpamScore(score).toFixed(2);
}

export const PRIORITY_LABELS = {
  emergency: "Emergency",
  high: "High",
  medium: "Medium",
  low: "Low",
};
