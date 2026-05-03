import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { issueService } from "../api/issueService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { toAssetUrl } from "../utils/helpers";

const STATUS_LABELS = {
  submitted: { label: "Submitted", color: "bg-yellow-100 text-yellow-800 ring-yellow-200", icon: "📋" },
  verified: { label: "Verified", color: "bg-blue-100 text-blue-800 ring-blue-200", icon: "✔️" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800 ring-purple-200", icon: "👷" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800 ring-orange-200", icon: "🔄" },
  pending_review: { label: "Pending Review", color: "bg-indigo-100 text-indigo-800 ring-indigo-200", icon: "🔍" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800 ring-green-200", icon: "✅" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700 ring-gray-200", icon: "🔒" },
  reopened: { label: "Reopened", color: "bg-red-100 text-red-800 ring-red-200", icon: "⚠️" },
};

const CATEGORY_LABELS = {
  road_transportation: { label: "Roads & Transport", icon: "🛣️" },
  water_sanitation: { label: "Water & Sanitation", icon: "💧" },
  electricity: { label: "Electricity", icon: "⚡" },
  waste_management: { label: "Waste Management", icon: "🗑️" },
  public_safety: { label: "Public Safety", icon: "🛡️" },
  environmental: { label: "Environmental", icon: "🌿" },
  other: { label: "Other", icon: "📌" },
};

const WORKFLOW_PHASES = [
  {
    title: "Received",
    subtitle: "Citizen report logged",
    match: ["submitted", "verified", "reopened"],
  },
  {
    title: "In progress",
    subtitle: "Authority working on it",
    match: ["assigned", "in_progress", "pending_review"],
  },
  {
    title: "Closed out",
    subtitle: "Resolved or closed",
    match: ["resolved", "closed"],
  },
];

function phaseIndexForStatus(status) {
  const i = WORKFLOW_PHASES.findIndex((p) => p.match.includes(status));
  return i >= 0 ? i : 0;
}

export default function ProblemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true);
        const response = await issueService.getIssueById(id);
        const issue = response?.data;
        if (!issue) throw new Error("Issue not found");
        setProblem(issue);
        setHasUpvoted(Boolean(issue.viewerHasUpvoted));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load issue details");
      } finally {
        setLoading(false);
      }
    };
    loadIssue();
  }, [id]);

  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      return;
    }
    try {
      setUpvoting(true);
      const response = await issueService.upvoteIssue(id);
      const newCount = response?.data?.upvoteCount ?? (problem.upvoteCount || 0);
      setHasUpvoted((prev) => {
        const next = !prev;
        setProblem((p) => ({ ...p, upvoteCount: newCount, viewerHasUpvoted: next }));
        toast.success(next ? "Upvoted!" : "Upvote removed");
        return next;
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  const activePhase = useMemo(
    () => (problem ? phaseIndexForStatus(problem.status) : 0),
    [problem]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f5] flex flex-col items-center justify-center gap-4">
        <div className="h-14 w-14 rounded-2xl border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading issue…</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Issue not found</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            This report may have been removed or the link is incorrect.
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm hover:shadow-lg transition-shadow"
          >
            Browse all issues
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[problem.status] || STATUS_LABELS.submitted;
  const categoryInfo = CATEGORY_LABELS[problem.category] || { label: problem.category || "Issue", icon: "📌" };
  const mediaList = Array.isArray(problem.media) ? problem.media.filter((m) => m?.url) : [];
  const hasMedia = mediaList.length > 0;
  const reportedDate = problem.createdAt ? new Date(problem.createdAt) : null;
  const daysOpen =
    reportedDate != null
      ? Math.max(0, Math.floor((Date.now() - reportedDate.getTime()) / (86400000)))
      : null;

  const priorityStyles = {
    emergency: "bg-red-500 text-white ring-red-600/30",
    high: "bg-orange-500 text-white ring-orange-600/30",
    medium: "bg-amber-400 text-gray-900 ring-amber-500/40",
    low: "bg-slate-200 text-slate-800 ring-slate-300",
  };

  return (
    <div className="min-h-screen bg-[#f0f4f2] pb-16">
      <div className="container mx-auto px-4 pt-6 max-w-6xl">
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 mb-6 transition-colors"
        >
          <span aria-hidden>←</span> Back to issues
        </Link>

        {/* Summary card */}
        <section className="rounded-3xl overflow-hidden shadow-xl shadow-green-900/10 ring-1 ring-black/5 bg-white mb-8">
          <div className="relative bg-gradient-to-br from-green-800 via-emerald-800 to-teal-900 text-white px-6 py-8 md:px-10 md:py-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden>
              <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-lime-300 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
              <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative grid lg:grid-cols-[1fr_min(340px,100%)] gap-8 lg:gap-10 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${statusInfo.color}`}
                  >
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
                    {categoryInfo.icon} {categoryInfo.label}
                  </span>
                  {problem.priority && (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-2 ring-inset capitalize ${priorityStyles[problem.priority] || priorityStyles.medium}`}
                    >
                      {problem.priority} priority
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-3 text-white drop-shadow-sm">
                  {problem.title}
                </h1>

                <p className="text-green-100/95 text-sm md:text-base flex flex-wrap gap-x-3 gap-y-1 mb-6">
                  <span className="font-mono text-green-50/90 bg-black/15 px-2 py-0.5 rounded-md text-xs md:text-sm">
                    {problem.issueId || String(problem._id).slice(-8)}
                  </span>
                  {reportedDate && (
                    <span>
                      Reported{" "}
                      <time dateTime={reportedDate.toISOString()}>
                        {reportedDate.toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-3">
                  <StatPill icon="⬆️" label="Upvotes" value={String(problem.upvoteCount ?? 0)} />
                  <StatPill icon="🎯" label="Severity" value={`${problem.severity ?? 3}/5`} />
                  {problem.affectedPeople > 0 && (
                    <StatPill icon="👥" label="Affected" value={String(problem.affectedPeople)} />
                  )}
                  {daysOpen !== null && (
                    <StatPill icon="📅" label="Days open" value={String(daysOpen)} />
                  )}
                </div>
              </div>

              {/* Visual: photos or rich fallback */}
              <div className="relative">
                {hasMedia ? (
                  <div className="rounded-2xl overflow-hidden border border-white/25 shadow-2xl bg-black/20">
                    <div className="grid gap-1 p-1 bg-black/30">
                      {mediaList.length === 1 ? (
                        <button
                          type="button"
                          className="relative aspect-[4/3] block focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl overflow-hidden group"
                          onClick={() => window.open(toAssetUrl(mediaList[0].url), "_blank", "noopener,noreferrer")}
                        >
                          <img
                            src={toAssetUrl(mediaList[0].url)}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-black/55 text-white backdrop-blur-sm">
                            Photo evidence · tap to enlarge
                          </span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            className="col-span-2 relative aspect-[16/10] block focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            onClick={() => window.open(toAssetUrl(mediaList[0].url), "_blank", "noopener,noreferrer")}
                          >
                            <img
                              src={toAssetUrl(mediaList[0].url)}
                              alt=""
                              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                            />
                          </button>
                          {mediaList.slice(1, 4).map((m, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="relative aspect-square block focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                              onClick={() => window.open(toAssetUrl(m.url), "_blank", "noopener,noreferrer")}
                            >
                              <img src={toAssetUrl(m.url)} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md px-6 py-8 md:py-10 text-center shadow-xl flex flex-col items-center justify-center min-h-[240px]">
                    <div className="text-6xl md:text-7xl mb-4 drop-shadow-lg">{categoryInfo.icon}</div>
                    <p className="text-white font-semibold text-lg">{categoryInfo.label}</p>
                    <p className="text-green-100/85 text-sm mt-2 max-w-[240px] leading-snug">
                      No photos were attached. Read the description and location below for full context.
                    </p>
                    <div className="mt-6 w-full max-w-[220px] space-y-2">
                      <div className="flex justify-between text-xs text-green-100 font-medium">
                        <span>Severity scale</span>
                        <span>{problem.severity ?? 3}/5</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-black/25 overflow-hidden ring-1 ring-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 shadow-inner transition-all duration-500"
                          style={{ width: `${((problem.severity ?? 3) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress timeline */}
          <div className="px-5 md:px-8 py-7 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Resolution progress</p>

            <ul className="sm:hidden space-y-0 border-l-2 border-gray-200 ml-[21px] pl-6 py-1">
              {WORKFLOW_PHASES.map((phase, idx) => {
                const done = idx < activePhase;
                const current = idx === activePhase;
                return (
                  <li key={phase.title} className="relative pb-8 last:pb-0">
                    <span
                      className={`absolute -left-[31px] top-0 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold border-2 ${
                        done
                          ? "bg-green-600 border-green-600 text-white"
                          : current
                            ? "bg-white border-green-600 text-green-700 shadow-md"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      {done ? "✓" : idx + 1}
                    </span>
                    <p className={`font-bold text-sm ${current ? "text-green-800" : done ? "text-gray-900" : "text-gray-400"}`}>
                      {phase.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{phase.subtitle}</p>
                  </li>
                );
              })}
            </ul>

            <div className="hidden sm:block relative px-2">
              <div className="absolute left-[calc(16.666%-22px)] right-[calc(16.666%-22px)] top-[22px] h-1 rounded-full bg-gray-200 z-0" aria-hidden />
              <div className="relative z-[1] grid grid-cols-3 gap-6">
                {WORKFLOW_PHASES.map((phase, idx) => {
                  const done = idx < activePhase;
                  const current = idx === activePhase;
                  return (
                    <div key={phase.title} className="flex flex-col items-center text-center pt-0">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold border-2 transition-colors ${
                          done
                            ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-700/25"
                            : current
                              ? "bg-white border-green-600 text-green-700 shadow-lg shadow-green-600/20"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        {done ? "✓" : idx + 1}
                      </div>
                      <p
                        className={`font-bold text-sm mt-4 ${current ? "text-green-800" : done ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {phase.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-snug max-w-[11rem]">{phase.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <article className="rounded-2xl bg-white p-6 md:p-8 shadow-lg shadow-gray-200/60 ring-1 ring-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-lg">📝</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">What happened</h2>
                  <p className="text-xs text-gray-500">Citizen report — full description</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-[15px] md:text-base whitespace-pre-wrap">
                {problem.description}
              </p>
            </article>

            <section className="rounded-2xl bg-white overflow-hidden shadow-lg shadow-gray-200/60 ring-1 ring-gray-100">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <h2 className="font-bold text-white text-sm">Location</h2>
                  <p className="text-slate-300 text-xs">Where authorities should respond</p>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gradient-to-b from-slate-50 to-white">
                <p className="text-gray-900 font-semibold text-base mb-4">{problem.address || "Address not specified"}</p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {problem.district && (
                    <>
                      <dt className="text-gray-500 font-medium">District</dt>
                      <dd className="text-gray-900 font-semibold">{problem.district}</dd>
                    </>
                  )}
                  {problem.upazila && (
                    <>
                      <dt className="text-gray-500 font-medium">Upazila / Thana</dt>
                      <dd className="text-gray-900 font-semibold">{problem.upazila}</dd>
                    </>
                  )}
                  {problem.ward && (
                    <>
                      <dt className="text-gray-500 font-medium">Ward</dt>
                      <dd className="text-gray-900 font-semibold">{problem.ward}</dd>
                    </>
                  )}
                  {problem.landmark && (
                    <>
                      <dt className="text-gray-500 font-medium">Landmark</dt>
                      <dd className="text-gray-900 font-semibold">{problem.landmark}</dd>
                    </>
                  )}
                </dl>
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-6 text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Map preview is not available in CPRS yet. Use the address above for navigation apps or share this page
                    with local authorities.
                  </p>
                </div>
              </div>
            </section>

            {hasMedia && mediaList.length > 1 && (
              <section className="rounded-2xl bg-white p-6 md:p-8 shadow-lg shadow-gray-200/60 ring-1 ring-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📸</span> All photos
                </h2>
                <p className="text-xs text-gray-500 mb-5">Tap any image to open full size.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mediaList.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-gray-200 hover:ring-green-400 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 group"
                      onClick={() => window.open(toAssetUrl(m.url), "_blank", "noopener,noreferrer")}
                    >
                      <img
                        src={toAssetUrl(m.url)}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml," +
                            encodeURIComponent(
                              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f3f4f6" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">Unavailable</text></svg>'
                            );
                        }}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {["resolved", "closed"].includes(problem.status) && problem.resolutionNote && (
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/80 p-6 md:p-8 shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h2 className="text-lg font-bold text-green-900 mb-2">Official resolution</h2>
                    <p className="text-green-900/90 leading-relaxed">{problem.resolutionNote}</p>
                    {problem.resolvedAt && (
                      <p className="text-sm text-green-700/80 mt-3 font-medium">
                        Resolved{" "}
                        {new Date(problem.resolvedAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/60 ring-1 ring-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Community</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-gray-900 tabular-nums">{problem.upvoteCount ?? 0}</span>
                <span className="text-sm font-semibold text-gray-500">upvotes</span>
              </div>
              <button
                type="button"
                onClick={handleUpvote}
                disabled={upvoting || !user}
                className={`mt-4 w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasUpvoted
                    ? "bg-amber-50 text-amber-800 ring-2 ring-amber-300 hover:bg-amber-100"
                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25"
                } disabled:opacity-45 disabled:cursor-not-allowed`}
              >
                <span className="text-lg">⬆️</span>
                {upvoting ? "Updating…" : hasUpvoted ? "Remove upvote" : "Support this issue"}
              </button>
              {!user && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  <Link to="/login" className="font-semibold text-green-700 hover:underline">
                    Sign in
                  </Link>{" "}
                  to add your vote
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/60 ring-1 ring-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Report meta</p>
              <div className="space-y-3">
                <DetailRow icon="👤" label="Reported by" value={problem.isAnonymous ? "Anonymous" : problem.reportedBy?.name || "Citizen"} />
                <DetailRow icon="🎯" label="Severity" value={`${problem.severity ?? 3} out of 5`} />
                {problem.expectedResolutionAt && (
                  <DetailRow
                    icon="🕐"
                    label="Target resolution"
                    value={new Date(problem.expectedResolutionAt).toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900 text-white p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">Next steps</p>
              <ul className="text-sm text-gray-300 space-y-2 mb-5 leading-snug">
                <li className="flex gap-2">
                  <span className="text-green-400 shrink-0">•</span>
                  Share this page if others are affected.
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 shrink-0">•</span>
                  Watch status updates as authorities progress.
                </li>
              </ul>
              <Link
                to="/problems"
                className="block w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-center text-sm font-semibold transition-colors mb-2"
              >
                More issues
              </Link>
              {user && (
                <Link
                  to="/report"
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-center text-sm font-bold hover:opacity-95 transition-opacity"
                >
                  Report another problem
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-black/20 backdrop-blur-sm border border-white/15 px-3 py-2 text-sm">
      <span aria-hidden>{icon}</span>
      <span className="text-green-50/90 font-medium">{label}</span>
      <span className="font-bold text-white tabular-nums">{value}</span>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex gap-3 text-sm py-2 border-b border-gray-100 last:border-0">
      <span className="text-lg shrink-0 leading-none">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-gray-900 font-semibold">{value}</p>
      </div>
    </div>
  );
}
