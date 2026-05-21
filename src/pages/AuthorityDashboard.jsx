import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import DashboardShell, { StatCard } from "../components/DashboardShell";
import { issueService } from "../api/issueService";
import { adminService } from "../api/adminService";
import { teamService } from "../api/teamService";
import { useAuth } from "../context/useAuth";
import { getRoleDisplayLabel } from "../utils/roles";
import { getStatusLabel, getCategoryLabel } from "../constants/issues";

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("issues");
  const [issues, setIssues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState({});

  const loadTeams = useCallback(async () => {
    try {
      const res = await teamService.getTeams(1, 50);
      setTeams(res?.data?.teams || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load teams");
    }
  }, []);

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
    loadTeams();
    loadData();
  }, [loadTeams, loadData]);

  const handleAssign = async (issueId) => {
    const teamId = selectedTeam[issueId];
    if (!teamId) {
      toast.error("Select a worker team");
      return;
    }
    setAssigningId(issueId);
    try {
      await issueService.assignIssue(issueId, { assignedTeam: teamId });
      toast.success("Team assigned successfully");
      setSelectedTeam((p) => ({ ...p, [issueId]: "" }));
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  const handleStatusUpdate = async (issueId, status) => {
    setProcessingId(issueId);
    try {
      await issueService.updateIssueStatus(issueId, { status });
      toast.success(status === "resolved" ? "Issue marked as resolved" : "Status updated");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = issues.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.title?.toLowerCase().includes(q) || i.issueId?.toLowerCase().includes(q);
  });

  const tabClass = (id) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      tab === id
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
    }`;

  return (
    <DashboardShell
      title={getRoleDisplayLabel(user) || "Authority Dashboard"}
      subtitle="Your Dhaka zone — assign to your 3 field teams, review repairs, and resolve cases"
      icon="🏛️"
      accent="from-indigo-900 via-indigo-800 to-violet-900"
      onRefresh={loadData}
      loading={loading}
    >
      <div className="mb-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm text-slate-700">
        <strong className="text-indigo-900">Your workflow:</strong> Verified issues arrive here → assign one of your{" "}
        <strong>Worker Teams (1–4)</strong> → team completes work and submits proof → you review and mark{" "}
        <strong>Resolved</strong>.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Open / Verified" value={stats?.openIssues ?? 0} color="text-blue-600" accent="from-blue-500/10 to-indigo-500/5" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolvedIssues ?? 0} color="text-emerald-600" />
        <StatCard icon="👥" label="Worker Teams" value={teams.length} color="text-purple-600" accent="from-purple-500/10 to-violet-500/5" />
        <StatCard icon="📊" label="Total Tracked" value={stats?.totalIssues ?? 0} color="text-slate-700" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button type="button" onClick={() => setTab("issues")} className={tabClass("issues")}>
          📋 Issues ({filtered.length})
        </button>
        <button type="button" onClick={() => setTab("teams")} className={tabClass("teams")}>
          👥 Teams ({teams.length})
        </button>
      </div>

      {tab === "issues" && (
        <div>
          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <input
              type="search"
              placeholder="Search by title or issue ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
            <button type="button" onClick={loadData} className="btn-primary bg-indigo-600 hover:from-indigo-700 hover:to-indigo-600">
              Search
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="card-elevated text-center py-16 text-slate-500">
              <p className="text-lg font-medium">No issues in your queue</p>
              <p className="text-sm mt-1">Verified reports will appear here for team assignment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((issue) => (
                <article key={issue._id} className="card-elevated p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Link to={`/problem/${issue._id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                        {issue.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{issue.issueId}</p>
                    </div>
                    <span className="badge bg-indigo-100 text-indigo-800 shrink-0">{getStatusLabel(issue.status)}</span>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{issue.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="badge bg-slate-100 text-slate-700">{getCategoryLabel(issue.category)}</span>
                    <span
                      className={`badge ${
                        issue.priority === "emergency" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {issue.priority?.toUpperCase()}
                    </span>
                    {(issue.zoneLabel || issue.zone) && (
                      <span className="badge bg-emerald-100 text-emerald-800">Zone: {issue.zoneLabel || issue.zone}</span>
                    )}
                    {issue.assignedTeam?.name && (
                      <span className="badge bg-purple-100 text-purple-800">Team: {issue.assignedTeam.name}</span>
                    )}
                  </div>

                  {["verified", "reopened"].includes(issue.status) && (
                    <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 mb-3">Assign to worker team</p>
                      {teams.length === 0 ? (
                        <p className="text-xs text-amber-700">No teams found. Run database seed to create Teams 1–4.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {teams.map((t) => (
                            <button
                              key={t._id}
                              type="button"
                              onClick={() => setSelectedTeam((p) => ({ ...p, [issue._id]: t._id }))}
                              className={`p-3 rounded-xl border-2 text-left text-xs transition-all ${
                                selectedTeam[issue._id] === t._id
                                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                                  : "border-slate-200 bg-white hover:border-indigo-300"
                              }`}
                            >
                              <span className="font-bold text-slate-800 block">{t.name}</span>
                              {t.zone && <span className="text-slate-500">{t.zone}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAssign(issue._id)}
                        disabled={assigningId === issue._id || !selectedTeam[issue._id]}
                        className="w-full btn-primary bg-indigo-600 text-sm py-2"
                      >
                        {assigningId === issue._id ? "Assigning…" : "Assign selected team"}
                      </button>
                    </div>
                  )}

                  {issue.status === "pending_review" && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-3">
                      <p className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Repair submitted — review proof on issue page
                      </p>
                      <p className="text-xs text-amber-800">Approve when work meets standards, or send back for more work.</p>
                    </div>
                  )}

                  {["in_progress", "pending_review"].includes(issue.status) && (
                    <div className="flex flex-wrap gap-2">
                      {issue.status === "pending_review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(issue._id, "resolved")}
                            disabled={processingId === issue._id}
                            className="flex-1 min-w-[120px] btn-primary text-sm py-2"
                          >
                            Approve & Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(issue._id, "in_progress")}
                            disabled={processingId === issue._id}
                            className="flex-1 min-w-[120px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-50"
                          >
                            Send back
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "teams" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {teams.length === 0 ? (
            <div className="card-elevated col-span-2 text-center py-12 text-slate-500">
              <p>No worker teams yet</p>
              <p className="text-sm mt-1">Run: npm run seed in the backend</p>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team._id} className="card-elevated p-5">
                <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{team.description || "Field operations unit"}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {team.zone && <span className="badge bg-blue-100 text-blue-800">{team.zone}</span>}
                  <span className="badge bg-slate-100 text-slate-700">{team.members?.length || 0} member(s)</span>
                  <span className="badge bg-emerald-100 text-emerald-800">
                    {team.statistics?.totalIssuesAssigned ?? 0} assigned
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardShell>
  );
}
