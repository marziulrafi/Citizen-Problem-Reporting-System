import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../api/services";
import { issueService } from "../api/issueService";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["submitted", "verified", "assigned", "in_progress", "pending_review", "resolved", "reopened", "closed"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        adminService.getDashboardStats(),
        issueService.getIssues({ page: 1, limit: 20 }),
      ]);
      setStats(statsRes?.data?.stats || null);
      setIssues(issuesRes?.data?.issues || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openCount = useMemo(
    () => issues.filter((issue) => !["resolved", "closed"].includes(issue.status)).length,
    [issues]
  );

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await issueService.updateIssueStatus(issueId, { status });
      toast.success("Status updated");
      await loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="mb-4">Admin access required.</p>
          <Link to="/" className="text-green-700 font-semibold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <button onClick={loadDashboard} className="px-4 py-2 rounded-lg bg-green-600 text-white">Refresh</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card title="Total Issues" value={stats?.totalIssues ?? 0} />
          <Card title="Open Issues" value={stats?.openIssues ?? openCount} />
          <Card title="Resolved" value={stats?.resolvedIssues ?? 0} />
          <Card title="Citizens" value={stats?.totalUsers ?? 0} />
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="text-left p-3">Issue</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Upvotes</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan="5">Loading...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td className="p-3" colSpan="5">No issues found</td></tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue._id} className="border-t">
                    <td className="p-3">
                      <div className="font-semibold">{issue.title}</div>
                      <div className="text-xs text-gray-500">{issue.issueId}</div>
                    </td>
                    <td className="p-3">{issue.category}</td>
                    <td className="p-3">{issue.status}</td>
                    <td className="p-3">{issue.upvoteCount || 0}</td>
                    <td className="p-3">
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
