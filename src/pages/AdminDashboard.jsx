import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    totalUpvotes: 0,
    avgResolutionTime: 0
  });

  // Categories for filter
  const categories = ["all", "Roads", "Sanitation", "Water Supply", "Utilities", "Traffic", "Health", "Infrastructure", "Environment", "Safety", "Parks"];

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filterStatus, filterCategory, problems]);

  const loadProblems = () => {
    setLoading(true);
    // Load from localStorage (combine static data + user reports)
    const storedProblems = JSON.parse(localStorage.getItem("problems")) || [];

    // For demo, also include static problems from data.js
    import("../data/data.js").then(module => {
      const staticProblems = module.problems || [];

      // Merge static and user-submitted problems, remove duplicates by id
      const allProblems = [...staticProblems];

      storedProblems.forEach(stored => {
        if (!allProblems.find(p => p.id === stored.id)) {
          allProblems.push(stored);
        }
      });

      setProblems(allProblems);
      calculateStats(allProblems);
      setLoading(false);
    }).catch(() => {
      // If data.js not available, just use stored problems
      setProblems(storedProblems);
      calculateStats(storedProblems);
      setLoading(false);
    });
  };

  const calculateStats = (problemsList) => {
    const total = problemsList.length;
    const pending = problemsList.filter(p => p.status === "pending").length;
    const inProgress = problemsList.filter(p => p.status === "in-progress").length;
    const resolved = problemsList.filter(p => p.status === "resolved").length;
    const totalUpvotes = problemsList.reduce((sum, p) => sum + (p.upvotes || 0), 0);

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      totalUpvotes,
      avgResolutionTime: 3.4 // Mock data
    });
  };

  const applyFilters = () => {
    let filtered = [...problems];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.citizenName?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));

    setFilteredProblems(filtered);
  };

  const updateProblemStatus = (problemId, newStatus, notes = "") => {
    const updatedProblems = problems.map(p => {
      if (p.id === problemId) {
        return {
          ...p,
          status: newStatus,
          resolutionNotes: notes || p.resolutionNotes,
          resolvedDate: newStatus === "resolved" ? new Date().toISOString() : p.resolvedDate
        };
      }
      return p;
    });

    setProblems(updatedProblems);

    // Save to localStorage
    const storedProblems = JSON.parse(localStorage.getItem("problems")) || [];
    const updatedStored = storedProblems.map(p => {
      if (p.id === problemId) {
        return {
          ...p,
          status: newStatus,
          resolutionNotes: notes || p.resolutionNotes
        };
      }
      return p;
    });

    // Also update static problems that might have been modified
    const allUpdated = [...updatedProblems];
    localStorage.setItem("problems", JSON.stringify(updatedStored));

    toast.success(`Problem status updated to ${newStatus}`);
    setShowModal(false);
    setSelectedProblem(null);
    setResolutionNotes("");
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500 text-white",
      "in-progress": "bg-blue-500 text-white",
      resolved: "bg-green-500 text-white"
    };
    const icons = {
      pending: "⏳",
      "in-progress": "🔄",
      resolved: "✅"
    };
    return {
      className: styles[status] || styles.pending,
      icon: icons[status] || "📋"
    };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Roads": "🛣️",
      "Sanitation": "🗑️",
      "Utilities": "⚡",
      "Water Supply": "💧",
      "Traffic": "🚦",
      "Health": "🏥",
      "Infrastructure": "🏗️",
      "Environment": "🌿",
      "Safety": "🛡️",
      "Parks": "🎠"
    };
    return icons[category] || "📌";
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Admin access required to view this page</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-800 via-purple-700 to-pink-800 text-white py-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-100">
                Welcome back, {user.name || user.email} | Manage and track all civic issues
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadProblems}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
              >
                🔄 Refresh
              </button>
              <Link
                to="/problems"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-all duration-300"
              >
                📊 View Public Map
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 text-gray-100" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">⬆️</div>
            <div className="text-2xl font-bold text-orange-600">{stats.totalUpvotes}</div>
            <div className="text-xs text-gray-500">Total Upvotes</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}</div>
            <div className="text-xs text-gray-500">Avg Days</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, description, location, or citizen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Citizen</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Upvotes</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="animate-spin inline-block w-8 h-8 border-b-2 border-purple-500 rounded-full"></div>
                    </td>
                  </tr>
                ) : filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => {
                    const statusStyle = getStatusBadge(problem.status);
                    return (
                      <tr key={problem.id} className="hover:bg-gray-50 transition-all">
                        <td className="px-4 py-3 text-sm font-mono">{problem.id.slice(-6)}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-800">{problem.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{problem.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            {getCategoryIcon(problem.category)} {problem.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{problem.location}</td>
                        <td className="px-4 py-3 text-sm">{problem.citizenName || "Anonymous"}</td>
                        <td className="px-4 py-3 text-sm">{new Date(problem.dateReported).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.className}`}>
                            {statusStyle.icon} {problem.status === "in-progress" ? "In Progress" : problem.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">{problem.upvotes || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              to={`/problem/${problem.id}`}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedProblem(problem);
                                setResolutionNotes(problem.resolutionNotes || "");
                                setShowModal(true);
                              }}
                              className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Update Problem Status</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Problem ID: <span className="font-mono">{selectedProblem.id}</span></p>
                <p className="font-semibold text-gray-800">{selectedProblem.title}</p>
                <p className="text-sm text-gray-600 mt-2">{selectedProblem.description}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProblemStatus(selectedProblem.id, "pending")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedProblem.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-yellow-100"
                      }`}
                  >
                    ⏳ Pending
                  </button>
                  <button
                    onClick={() => updateProblemStatus(selectedProblem.id, "in-progress")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedProblem.status === "in-progress"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                      }`}
                  >
                    🔄 In Progress
                  </button>
                  <button
                    onClick={() => updateProblemStatus(selectedProblem.id, "resolved", resolutionNotes)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedProblem.status === "resolved"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100"
                      }`}
                  >
                    ✅ Resolved
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes (Optional)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows="3"
                  placeholder="Add notes about how this issue was resolved..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateProblemStatus(selectedProblem.id, selectedProblem.status === "resolved" ? "resolved" : "in-progress", resolutionNotes)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}