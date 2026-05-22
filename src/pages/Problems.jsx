import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { issueService } from "../api/issueService";
import toast from "react-hot-toast";

export default function Problems() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const { user } = useAuth();

  const mapCategoryFromAPI = (apiCategory) => {
    const categoryMap = {
      "road_transportation": "Roads",
      "water_sanitation": "Sanitation",
      "electricity": "Utilities",
      "waste_management": "Sanitation",
      "public_safety": "Safety",
      "environmental": "Environment",
      "other": "Parks",
    };
    return categoryMap[apiCategory] || "Other";
  };

  const mapStatusFromAPI = (apiStatus) => {
    const statusMap = {
      "submitted": "pending",
      "verified": "pending",
      "assigned": "in-progress",
      "in_progress": "in-progress",
      "pending_review": "in-progress",
      "resolved": "resolved",
      "closed": "resolved",
      "reopened": "pending",
    };
    return statusMap[apiStatus] || "pending";
  };

  const categories = ["all", ...new Set(problems.map((p) => p.category).filter(Boolean))];
  const statuses = ["all", "pending", "in-progress", "resolved"];

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await issueService.getPublicFeed(1, 50);
        
        if (response.success && response.data && response.data.issues) {
          const apiIssues = response.data.issues.map((issue) => ({
            id: issue._id,
            issueId: issue.issueId,
            title: issue.title,
            description: issue.description,
            category: mapCategoryFromAPI(issue.category),
            status: mapStatusFromAPI(issue.status),
            location: issue.address || issue.zoneLabel || "Dhaka",
            zoneLabel: issue.zoneLabel,
            upvotes: issue.upvoteCount || 0,
            dateReported: new Date(issue.createdAt).toISOString().split("T")[0],
            citizenName: issue.reportedBy?.name || "Anonymous",
            resolutionNotes: issue.resolutionNote || "",
          }));

          setProblems(apiIssues);
        } else {
          setProblems([]);
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
        toast.error("Failed to fetch issues");
        setProblems([]);
      }
    };

    fetchIssues();
  }, []);

  const filteredProblems = useMemo(() => {
    let filtered = [...problems];

    if (search) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.dateReported) - new Date(b.dateReported));
        break;
      case "most-upvoted":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "least-upvoted":
        filtered.sort((a, b) => a.upvotes - b.upvotes);
        break;
      default:
        break;
    }

    return filtered;
  }, [search, selectedCategory, selectedStatus, sortBy, problems]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      "in-progress": "bg-blue-500/20 text-blue-600 border-blue-500/30",
      resolved: "bg-green-500/20 text-green-600 border-green-500/30"
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      "in-progress": "🔄",
      resolved: "✅"
    };
    return icons[status] || "📋";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Roads": "🛣️",
      "Sanitation": "🗑️",
      "Utilities": "⚡",
      "Water Supply": "💧",
      "Traffic": "🚦",
      "Health": "🦟",
      "Infrastructure": "🏗️",
      "Environment": "🌿",
      "Safety": "🛡️",
      "Parks": "🎠"
    };
    return icons[category] || "📌";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dhaka Civic Issues</h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto">
            Browse reported problems across 12 Dhaka zones — track status from submission to resolution
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              📊 {problems.length} Total Reports
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              ✅ {problems.filter((p) => p.status === "resolved").length} Resolved
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              🔄 {problems.filter((p) => p.status === "in-progress").length} In Progress
            </span>
          </div>
        </div>
        
        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 text-gray-100" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-4 pl-12 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
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

          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat === "all" ? "All Categories" : getCategoryIcon(cat) + " " + cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort and Status */}
              <div className="flex gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status} className="capitalize">
                      {status === "all" ? "All Status" : status}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-upvoted">Most Upvoted</option>
                  <option value="least-upvoted">Least Upvoted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <span>🔧</span>
              <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>

            {isFilterOpen && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 capitalize ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 capitalize ${
                          selectedStatus === status
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status === "all" ? "All" : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-upvoted">Most Upvoted</option>
                    <option value="least-upvoted">Least Upvoted</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedStatus !== "all" || search) && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedCategory !== "all" && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                  {getCategoryIcon(selectedCategory)} {selectedCategory}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
              {selectedStatus !== "all" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-1">
                  {getStatusIcon(selectedStatus)} {selectedStatus}
                  <button onClick={() => setSelectedStatus("all")} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
              {search && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-1">
                  🔍 {search}
                  <button onClick={() => setSearch("")} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <p className="text-slate-600">
            Showing <span className="font-bold text-emerald-600">{filteredProblems.length}</span> of{" "}
            <span className="font-bold">{problems.length}</span> reports in Dhaka
          </p>
          {user && (
            <Link to="/report" className="btn-primary text-sm py-2">
              Report issue
            </Link>
          )}
        </div>
      </div>

      <section className="container mx-auto px-4 py-8">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No issues found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-6 pb-3 border-b border-gray-100 bg-gradient-to-r from-green-50/80 to-gray-50">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">
                    {getCategoryIcon(problem.category)} {problem.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(problem.status)}`}>
                    {getStatusIcon(problem.status)} {problem.status}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-500">
                      <span>⬆️</span>
                      <span className="text-sm font-semibold">{problem.upvotes}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {problem.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{problem.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📅</span>
                      <span>{new Date(problem.dateReported).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>👤</span>
                      <span>{problem.citizenName}</span>
                    </div>
                  </div>

                  <Link
                    to={`/problem/${problem.id}`}
                    className="inline-flex items-center justify-between w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 group/link"
                  >
                    <span>View Details</span>
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Want to report an issue?</h3>
            <p className="mb-4">Login to submit a new civic issue report</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Login Now →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}