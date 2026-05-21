import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Send } from "lucide-react";
import DashboardShell, { StatCard } from "../components/DashboardShell";
import { issueService } from "../api/issueService";
import { adminService } from "../api/adminService";
import { useAuth } from "../context/useAuth";
import { getRoleDisplayLabel } from "../utils/roles";
import { getStatusLabel, getCategoryLabel } from "../constants/issues";

export default function FieldWorkerDashboard() {
  const { user } = useAuth();
  const teamLabel = getRoleDisplayLabel(user);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [progressNotes, setProgressNotes] = useState({});
  const [currentProgress, setCurrentProgress] = useState({});
  const [proofFiles, setProofFiles] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        adminService.getDashboardStats(),
        issueService.getIssues({ page: 1, limit: 50, search: search || undefined }),
      ]);
      setStats(statsRes?.data?.stats);
      setIssues(issuesRes?.data?.issues || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (issueId, newStatus) => {
    setProcessingId(issueId);
    try {
      const data = { status: newStatus };
      if (progressNotes[issueId]) data.resolutionNote = progressNotes[issueId];
      if (currentProgress[issueId]) data.currentProgress = parseInt(currentProgress[issueId], 10);

      let res;
      if (newStatus === "pending_review" && proofFiles[issueId]?.length) {
        const fd = new FormData();
        fd.append("status", newStatus);
        fd.append("resolutionNote", progressNotes[issueId] || "");
        proofFiles[issueId].forEach((f) => fd.append("repairProof", f));
        res = await issueService.updateIssueStatusWithFiles(issueId, fd);
      } else {
        res = await issueService.updateIssueStatus(issueId, data);
      }

      toast.success(res.message || "Submitted successfully");
      setProgressNotes((p) => ({ ...p, [issueId]: "" }));
      setCurrentProgress((p) => ({ ...p, [issueId]: "" }));
      setProofFiles((p) => ({ ...p, [issueId]: [] }));
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = issues.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.title?.toLowerCase().includes(q) || i.issueId?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <DashboardShell
      title={teamLabel}
      subtitle="Team tasks — start work on site, upload repair photos, submit for authority review"
      icon="👷"
      accent="from-violet-900 via-purple-800 to-fuchsia-900"
      onRefresh={loadData}
      loading={loading}
    >
      <div className="mb-8 p-4 rounded-2xl bg-purple-50 border border-purple-100 text-sm text-slate-700">
        <strong className="text-purple-900">Team workflow:</strong> Your authority assigns issues to{" "}
        <strong>{user?.team?.name || "your team"}</strong>. Update progress, photograph completed repairs, then
        submit for review.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Assigned" value={stats?.totalIssues ?? 0} color="text-blue-600" />
        <StatCard icon="⏳" label="In Progress" value={issues.filter((i) => i.status === "in_progress").length} color="text-orange-600" accent="from-orange-500/10 to-amber-500/5" />
        <StatCard icon="📤" label="Pending Review" value={issues.filter((i) => i.status === "pending_review").length} color="text-amber-600" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolvedIssues ?? 0} color="text-emerald-600" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex flex-wrap gap-2">
          {["all", "assigned", "in_progress", "pending_review"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                statusFilter === status ? "bg-purple-600 text-white shadow" : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No tasks for your team</p>
          <p className="text-sm mt-1">New assignments appear when authority assigns your team</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => (
            <article key={issue._id} className="card-elevated p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Link to={`/problem/${issue._id}`} className="font-semibold text-slate-900 hover:text-purple-600">
                    {issue.title}
                  </Link>
                  <p className="text-xs text-slate-500">{issue.issueId}</p>
                </div>
                <span className="badge bg-purple-100 text-purple-800">{getStatusLabel(issue.status)}</span>
              </div>

              <p className="text-sm text-slate-600 mb-3">{issue.address && `📍 ${issue.address}`}</p>

              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="badge bg-slate-100">{getCategoryLabel(issue.category)}</span>
                <span className={`badge ${issue.priority === "emergency" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                  {issue.priority?.toUpperCase()}
                </span>
              </div>

              {issue.currentProgress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1 text-slate-600">
                    <span>Progress</span>
                    <span className="font-semibold">{issue.currentProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${issue.currentProgress}%` }} />
                  </div>
                </div>
              )}

              {["assigned", "in_progress"].includes(issue.status) && (
                <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100">
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Progress</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProgress[issue._id] || 0}
                    onChange={(e) => setCurrentProgress((p) => ({ ...p, [issue._id]: e.target.value }))}
                    className="w-full accent-purple-600"
                  />
                  <textarea
                    value={progressNotes[issue._id] || ""}
                    onChange={(e) => setProgressNotes((p) => ({ ...p, [issue._id]: e.target.value }))}
                    placeholder="Work notes..."
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none"
                    rows={2}
                  />

                  {issue.status === "assigned" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(issue._id, "in_progress")}
                      disabled={processingId === issue._id}
                      className="w-full mt-3 btn-primary bg-orange-500 hover:from-orange-600 hover:to-orange-500 text-sm"
                    >
                      Start work on site
                    </button>
                  )}

                  {issue.status === "in_progress" && (
                    <div className="mt-3 space-y-2">
                      <label className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                        <Camera className="w-3.5 h-3.5" />
                        Repair photos (required)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setProofFiles((p) => ({ ...p, [issue._id]: Array.from(e.target.files || []).slice(0, 3) }))}
                        className="text-xs w-full"
                      />
                      {proofFiles[issue._id]?.length > 0 && (
                        <p className="text-xs text-emerald-600">{proofFiles[issue._id].length} photo(s) ready</p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(issue._id, "pending_review")}
                        disabled={processingId === issue._id}
                        className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Submit for authority review
                      </button>
                    </div>
                  )}
                </div>
              )}

              {issue.status === "pending_review" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                  Awaiting authority approval — you will be notified when resolved.
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
