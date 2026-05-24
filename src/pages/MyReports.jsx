import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { issueService } from "../api/issueService";
import { STATUS_LABELS, CATEGORY_LABELS } from "../constants/issues";
import toast from "react-hot-toast";

export default function MyReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserReports = async () => {
      try {
        setLoading(true);
        const response = await issueService.getMyIssues(1, 100);

        if (response.success && response.data && response.data.issues) {
          const apiReports = response.data.issues.map((issue) => ({
            id: issue._id,
            issueId: issue.issueId,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            categoryLabel: CATEGORY_LABELS[issue.category]?.label || issue.category,
            status: issue.status,
            statusLabel: STATUS_LABELS[issue.status]?.label || issue.status,
            assignedWorkers: issue.assignedWorkers || [],
            location: issue.address || "Dhaka",
            dateReported: new Date(issue.createdAt).toISOString().split("T")[0],
            upvotes: issue.upvoteCount || 0,
            resolutionNotes: issue.resolutionNote || "",
            citizenName: issue.reportedBy?.name || "Anonymous",
            citizenEmail: user.email,
          }));

          setMyReports(apiReports);
        } else {
          setMyReports([]);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        toast.error("Failed to fetch your reports");
        setMyReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [user, navigate]);


  const getStatusBadge = (status) => {
    const info = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-700", icon: "📋" };
    return {
      className: `${info.color} border border-gray-200/50`,
      icon: info.icon,
      label: info.label,
    };
  };

  const filteredReports = myReports.filter(report => {
    if (filter !== "all" && report.status !== filter) return false;

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const stats = {
    total: myReports.length,
    pending: myReports.filter((r) => ["submitted", "verified"].includes(r.status)).length,
    inProgress: myReports.filter((r) =>
      ["assigned", "in_progress", "pending_review", "reopened"].includes(r.status)
    ).length,
    resolved: myReports.filter((r) => ["resolved", "closed"].includes(r.status)).length,
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                My Reports
              </h1>
              <p className="text-gray-100">
                Track and manage all your reported civic issues
              </p>
            </div>
            <Link
              to="/report"
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/30"
            >
              <span>📝</span>
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>

        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 text-gray-100" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Reports</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search your reports by title, description, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 pl-12 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === "all"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              All Reports ({stats.total})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === "pending"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              ⏳ Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter("in-progress")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === "in-progress"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              🔄 In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === "resolved"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              ✅ Resolved ({stats.resolved})
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-6">
              {search || filter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't reported any issues yet"}
            </p>
            {(search || filter !== "all") ? (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/report"
                className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Report Your First Issue →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results count */}
            <div className="text-sm text-gray-500 mb-2">
              Showing {filteredReports.length} of {myReports.length} reports
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => {
                const statusStyle = getStatusBadge(report.status);
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-6 pb-3 border-b border-gray-100 bg-gradient-to-r from-green-50/80 to-gray-50">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">
                        {CATEGORY_LABELS[report.category]?.icon || "📌"} {report.categoryLabel}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${statusStyle.className}`}>
                        {statusStyle.icon} {statusStyle.label}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
                          {report.title}
                        </h3>
                        <div className="flex items-center gap-1 text-orange-500">
                          <span>⬆️</span>
                          <span className="text-sm font-semibold">{report.upvotes}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>📍</span>
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>📅</span>
                          <span>{new Date(report.dateReported).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>🆔</span>
                          <span className="font-mono text-xs">{report.issueId}</span>
                        </div>
                        {report.assignedWorkers?.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-purple-700">
                            <span>👷</span>
                            <span>
                              Assigned: {report.assignedWorkers.map((w) => w.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {["resolved", "closed"].includes(report.status) && report.resolutionNotes && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start gap-2">
                            <span className="text-green-500">✅</span>
                            <div>
                              <p className="text-xs font-semibold text-green-700">Resolution Note:</p>
                              <p className="text-xs text-green-600">{report.resolutionNotes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Link
                        to={`/problem/${report.id}`}
                        className="inline-flex items-center justify-between w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group"
                      >
                        <span>View Details</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      {myReports.length > 0 && (
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-center text-white">
            <p className="text-lg font-semibold mb-2">Want to report another issue?</p>
            <Link
              to="/report"
              className="inline-block px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Submit New Report →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}