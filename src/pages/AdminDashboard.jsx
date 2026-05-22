import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../api/adminService";
import { issueService } from "../api/issueService";
import { ROLES, ROLE_LABELS } from "../utils/roles";

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

const CATEGORY_ICONS = {
  road_transportation: "🛣️",
  water_sanitation: "💧",
  electricity: "⚡",
  waste_management: "🗑️",
  public_safety: "🛡️",
  environmental: "🌿",
  other: "📌",
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
      toast.error(err.response?.data?.message || "Failed to load dashboard");
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
      toast.error(err.response?.data?.message || "Failed to load users");
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
      setIssues((prev) => prev.map((i) => i._id === issueId ? { ...i, status } : i));
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
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
      toast.error(err.response?.data?.message || "Failed to update role");
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
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                ⚙️ Admin Dashboard
              </h1>
              <p className="text-green-200 mt-1">Manage issues and users for CPRS Bangladesh</p>
            </div>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2"
            >
              {loading ? "⏳" : "🔄"} Refresh
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 text-gray-100" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-4">
          <StatCard icon="📊" label="Total Issues" value={stats?.totalIssues ?? 0} color="text-gray-800" />
          <StatCard icon="⏳" label="Open Issues" value={stats?.openIssues ?? 0} color="text-yellow-600" />
          <StatCard icon="✅" label="Resolved" value={stats?.resolvedIssues ?? 0} color="text-green-600" />
          <StatCard icon="👥" label="Citizens" value={stats?.totalUsers ?? 0} color="text-blue-600" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "issues", label: "📋 Issues", count: issues.length },
            { id: "users", label: "👥 Users", count: users.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-white/30 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Status Filter */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === "all" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All ({issues.length})
              </button>
              {ALL_STATUSES.map((s) => {
                const count = issues.filter((i) => i.status === s).length;
                if (count === 0) return null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${statusFilter === s ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {s.replace("_", " ")} ({count})
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-700 to-emerald-700 text-white">
                  <tr>
                    <th className="text-left p-4">Issue</th>
                    <th className="text-left p-4 hidden md:table-cell">Category</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4 hidden sm:table-cell">Upvotes</th>
                    <th className="text-left p-4">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        No issues found
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <Link to={`/problem/${issue._id}`} className="hover:text-green-700 transition-colors">
                            <div className="font-semibold text-gray-800 line-clamp-1">{issue.title}</div>
                            <div className="text-xs text-gray-400">{issue.issueId}</div>
                          </Link>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">
                            {CATEGORY_ICONS[issue.category]} {issue.category?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[issue.status] || "bg-gray-100 text-gray-600"}`}>
                            {issue.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-gray-600">
                          ⬆️ {issue.upvoteCount || 0}
                        </td>
                        <td className="p-4">
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                            disabled={updatingId === issue._id}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-50"
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-700 to-emerald-700 text-white">
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
                      <td colSpan="5" className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">No users found</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{u.name}</div>
                          <div className="text-xs text-gray-400 md:hidden">{u.email}</div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-gray-600 text-sm">{u.email}</td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {u.isActive ? "✅ Active" : "❌ Inactive"}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleToggleUser(u._id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                u.isActive
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
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
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 transform hover:scale-105 transition-all duration-300">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
