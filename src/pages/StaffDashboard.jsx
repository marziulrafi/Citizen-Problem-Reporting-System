import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardShell, { StatCard } from "../components/DashboardShell";
import { adminService } from "../api/adminService";
import { issueService } from "../api/issueService";
import { ALL_STATUSES, STATUS_LABELS, CATEGORY_LABELS } from "../constants/issues";
import { ROLE_LABELS } from "../utils/roles";

const ROLE_CONFIG = {
  authority: {
    title: "Authority Dashboard",
    subtitle: "Assign verified issues → field workers track & fix → you review",
    icon: "🏛️",
    defaultStatusFilter: "all",
    issuesHeading: "Issue queue",
    allowedTransitions: {
      assigned: ["in_progress"],
      in_progress: ["pending_review"],
      reopened: ["in_progress"],
    },
    canAssign: true,
  },
  field_worker: {
    title: "Field Worker Dashboard",
    subtitle: "Your assigned tasks — start work, upload proof, submit for review",
    icon: "👷",
    defaultStatusFilter: "all",
    issuesHeading: "My assigned tasks",
    allowedTransitions: {
      assigned: ["in_progress"],
      in_progress: ["pending_review"],
    },
    canAssign: false,
  },
  moderator: {
    title: "Moderator Dashboard",
    subtitle: "Verify reports → approve completed field work",
    icon: "🛡️",
    defaultStatusFilter: "submitted",
    issuesHeading: "Review queue",
    allowedTransitions: {
      submitted: ["verified", "closed"],
      reopened: ["verified", "closed"],
      pending_review: ["resolved", "reopened"],
    },
    canAssign: false,
  },
};

function WorkerChips({ workers }) {
  if (!workers?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {workers.map((w) => (
        <span key={w._id} className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
          👷 {w.name}
        </span>
      ))}
    </div>
  );
}

export default function StaffDashboard({ role }) {
  const config = ROLE_CONFIG[role];
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(config.defaultStatusFilter);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [resolutionNote, setResolutionNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        adminService.getDashboardStats(),
        issueService.getIssues({ page: 1, limit: 50, search: search || undefined }),
      ]);
      setStats(statsRes?.data?.stats || null);
      setActivity(statsRes?.data?.recentActivity || []);
      setIssues(issuesRes?.data?.issues || []);
      if (config.canAssign) {
        const wRes = await adminService.getWorkers();
        setWorkers(wRes?.data?.workers || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [search, config.canAssign]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = issues;
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.issueId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [issues, statusFilter, search]);

  const nextStatuses = (current) => config.allowedTransitions[current] || [];

  const handleStatus = async (issueId, status, withProof = false) => {
    setUpdatingId(issueId);
    try {
      let res;
      if (withProof && proofFiles[issueId]?.length) {
        const fd = new FormData();
        fd.append("status", status);
        proofFiles[issueId].forEach((f) => fd.append("repairProof", f));
        res = await issueService.updateIssueStatusWithFiles(issueId, fd);
      } else {
        const body = { status };
        if (resolutionNote && status === "resolved") body.resolutionNote = resolutionNote;
        res = await issueService.updateIssueStatus(issueId, body);
      }
      toast.success(res.message || "Status updated");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleWorker = (issueId, workerId) => {
    setSelectedWorkers((prev) => {
      const list = prev[issueId] || [];
      const on = list.includes(workerId);
      return {
        ...prev,
        [issueId]: on ? list.filter((id) => id !== workerId) : [...list, workerId],
      };
    });
  };

  const handleAssign = async (issueId) => {
    const workerIds = selectedWorkers[issueId] || [];
    if (!workerIds.length) {
      toast.error("Select at least one field worker");
      return;
    }
    setAssigningId(issueId);
    try {
      const res = await issueService.assignIssue(issueId, { workerIds });
      toast.success(res.message || "Workers assigned");
      setSelectedWorkers((p) => ({ ...p, [issueId]: [] }));
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <DashboardShell
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      onRefresh={load}
      loading={loading}
    >
      <div className="mb-6 p-4 rounded-xl bg-white border border-green-100 text-sm text-gray-700">
        <strong className="text-green-800">How it works:</strong>{" "}
        {role === "authority" && "Pick verified issues → assign workers → they fix on-site → you mark in progress → they submit proof → moderator resolves."}
        {role === "field_worker" && "Open assigned task → Start work → Upload repair photos → Submit for review."}
        {role === "moderator" && "Verify new reports → When field work is done, approve or reopen from pending review."}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-4">
        <StatCard icon="📊" label="In your queue" value={stats?.totalIssues ?? 0} />
        <StatCard icon="⏳" label="Open" value={stats?.openIssues ?? 0} color="text-yellow-600" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolvedIssues ?? 0} color="text-green-600" />
        <StatCard icon="👤" label="Role" value={ROLE_LABELS[role]} color="text-emerald-700" />
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg"
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
          ))}
        </select>
        <button type="button" onClick={load} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-800">{config.issuesHeading}</div>
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No issues in this queue.</p>
          ) : (
            <div className="divide-y">
              {filtered.map((issue) => {
                const transitions = nextStatuses(issue.status);
                const cat = CATEGORY_LABELS[issue.category] || { icon: "📌" };
                const st = STATUS_LABELS[issue.status] || { label: issue.status, color: "bg-gray-100" };
                const canAssignHere =
                  config.canAssign && ["verified", "reopened", "assigned"].includes(issue.status);

                return (
                  <div key={issue._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <Link to={`/problem/${issue._id}`} className="font-semibold text-green-700 hover:underline">
                          {cat.icon} {issue.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{issue.issueId}</p>
                        <WorkerChips workers={issue.assignedWorkers} />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>

                    {canAssignHere && (
                      <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-2">Assign field workers</p>
                        {workers.length === 0 ? (
                          <p className="text-xs text-amber-700">No workers — admin must add field_worker users.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {workers.map((w) => {
                              const sel = (selectedWorkers[issue._id] || []).includes(String(w._id));
                              return (
                                <button
                                  key={w._id}
                                  type="button"
                                  onClick={() => toggleWorker(issue._id, String(w._id))}
                                  className={`text-xs px-3 py-1 rounded-full border ${
                                    sel ? "bg-purple-600 text-white border-purple-600" : "bg-white border-purple-200 text-purple-800"
                                  }`}
                                >
                                  {sel ? "✓ " : ""}{w.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={assigningId === issue._id}
                          onClick={() => handleAssign(issue._id)}
                          className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg"
                        >
                          Confirm assignment
                        </button>
                      </div>
                    )}

                    {role === "field_worker" && issue.status === "in_progress" && (
                      <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                        <p className="text-xs font-semibold text-orange-900 mb-2">Upload repair proof before submitting</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            setProofFiles((p) => ({
                              ...p,
                              [issue._id]: Array.from(e.target.files || []).slice(0, 3),
                            }))
                          }
                          className="text-xs w-full"
                        />
                      </div>
                    )}

                    {transitions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {transitions.map((s) => {
                          const needsProof = role === "field_worker" && s === "pending_review";
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={updatingId === issue._id}
                              onClick={() => handleStatus(issue._id, s, needsProof)}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              {needsProof ? "Submit with photos" : `Mark as ${STATUS_LABELS[s]?.label || s}`}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {role === "moderator" && issue.status === "pending_review" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Resolution note (optional)"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="text-xs w-full border rounded-lg px-2 py-1 mb-2"
                        />
                      </div>
                    )}

                    <Link
                      to={`/problem/${issue._id}`}
                      className="text-xs text-green-600 hover:underline mt-2 inline-block"
                    >
                      Open full details →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {activity.map((a) => (
                <li key={a._id} className="text-sm border-l-2 border-green-400 pl-3">
                  <p className="font-medium">{a.issue?.title || "Issue"}</p>
                  <p className="text-gray-500 text-xs capitalize">
                    {a.action?.replace(/_/g, " ")} · {a.performedBy?.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
