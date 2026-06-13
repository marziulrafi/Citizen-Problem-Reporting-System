import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../api/adminService";
import { issueService } from "../api/issueService";
import DashboardShell, { StatCard } from "../components/DashboardShell";
import { ROLES, ROLE_LABELS } from "../utils/roles";
import { getCategoryLabel } from "../constants/issues";
import { formatSpamScore } from "../utils/aiDisplay";

const ALL_STATUSES = [
  "submitted", "verified", "assigned", "in_progress",
  "pending_review", "resolved", "reopened", "closed",
];

const STATUS_COLORS = {
  submitted: "bg-yellow-100 text-yellow-800",
  verified: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  pending_review: "bg-indigo-100 text-indigo-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
  reopened: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("issues");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        adminService.getDashboardStats(),
        issueService.getIssues({ page: 1, limit: 50 }),
      ]);
      setStats(statsRes?.data?.stats || null);
      setIssues(issuesRes?.data?.issues || []);
    } catch (err) {
      toast.error(err.apiMessage || err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getAllUsers(1, 50);
      setUsers(res?.data?.users || []);
    } catch (err) {
      toast.error(err.apiMessage || err.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) {
      loadUsers();
    }
  }, [activeTab, users.length]);

  const filteredIssues = useMemo(() => {
    if (statusFilter === "all") return issues;
    return issues.filter((i) => i.status === statusFilter);
  }, [issues, statusFilter]);

  const handleStatusUpdate = async (issueId, status) => {
    setUpdatingId(issueId);
    try {
      await issueService.updateIssueStatus(issueId, { status });
      toast.success("Status updated");
      setIssues((prev) => prev.map((i) => (i._id === issueId ? { ...i, status } : i)));
    } catch (err) {
      toast.error(err.apiMessage || err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await adminService.updateUserRole(userId, role);
      toast.success(res.message || "Role updated");
      const updated = res?.data?.user;
      if (updated) {
        setUsers((prev) =>
          prev.map((u) => (String(u._id) === String(userId) ? { ...u, ...updated } : u))
        );
      }
    } catch (err) {
      toast.error(err.apiMessage || err.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      toast.success(res.message || "User status updated");
      const updated = res?.data?.user;
      if (updated) {
        setUsers((prev) =>
          prev.map((u) => (String(u._id) === String(userId) ? { ...u, ...updated } : u))
        );
      }
    } catch (err) {
      toast.error(err.apiMessage || err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Manage issues, users, and system-wide CPRS operations"
      icon="⚙️"
      accent="from-emerald-800 via-green-700 to-teal-800"
      onRefresh={loadDashboard}
      loading={loading}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📊" label="Total Issues" value={stats?.totalIssues ?? 0} />
        <StatCard icon="⏳" label="Open Issues" value={stats?.openIssues ?? 0} color="text-amber-600" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolvedIssues ?? 0} color="text-emerald-600" />
        <StatCard icon="👥" label="Citizens" value={stats?.totalUsers ?? 0} color="text-blue-600" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: "issues", label: "📋 Issues", count: issues.length },
          { id: "users", label: "👥 Users", count: users.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-white/25" : "bg-slate-100"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "issues" && (
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              All ({issues.length})
            </button>
            {ALL_STATUSES.map((s) => {
              const count = issues.filter((i) => i.status === s).length;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {s.replace("_", " ")} ({count})
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="text-left p-4">Issue</th>
                  <th className="text-left p-4 hidden md:table-cell">Category</th>
                  <th className="text-left p-4 hidden lg:table-cell">AI</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4 hidden sm:table-cell">Upvotes</th>
                  <th className="text-left p-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">Loading…</td>
                  </tr>
                ) : filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No issues found</td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <Link to={`/problem/${issue._id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                          {issue.title}
                        </Link>
                        <div className="text-xs text-slate-400">{issue.issueId}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-slate-600">
                        {getCategoryLabel(issue.category)}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {issue.isLikelySpam ? (
                          <span className="text-xs font-semibold text-red-700" title={issue.spamReason}>
                            Spam {formatSpamScore(issue.spamScore)}
                          </span>
                        ) : issue.aiPriority ? (
                          <span className="text-xs text-violet-700 capitalize">{issue.aiPriority}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[issue.status] || "bg-slate-100"}`}>
                          {issue.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">⬆️ {issue.upvoteCount || 0}</td>
                      <td className="p-4">
                        <select
                          value={issue.status}
                          onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                          disabled={updatingId === issue._id}
                          className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white disabled:opacity-50"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4 hidden md:table-cell">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">Loading…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="p-4 hidden md:table-cell text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleToggleUser(u._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.isActive ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
