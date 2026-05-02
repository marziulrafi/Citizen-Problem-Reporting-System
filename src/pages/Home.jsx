import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { issueService } from "../api/issueService";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const toAssetUrl = (url) => (url?.startsWith("http") ? url : `${API_ORIGIN}${url || ""}`);

export default function Home() {
  const [recentProblems, setRecentProblems] = useState([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const response = await issueService.getPublicFeed(1, 3);
        const issues = response?.data?.issues || [];
        setRecentProblems(issues);
      } catch {
        setRecentProblems([]);
      }
    };
    loadRecent();
  }, []);

  const stats = {
    total: 12450,
    resolutionRate: 89,
  };

  const categories = [
    { name: "Roads", icon: "🛣️", count: 3420, color: "bg-blue-100" },
    { name: "Waste Management", icon: "🗑️", count: 2850, color: "bg-green-100" },
    { name: "Water Supply", icon: "💧", count: 1890, color: "bg-cyan-100" },
    { name: "Utilities", icon: "⚡", count: 1650, color: "bg-yellow-100" },
    { name: "Traffic", icon: "🚦", count: 1420, color: "bg-red-100" },
    { name: "Safety", icon: "🛡️", count: 1220, color: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-700 to-green-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Report. Track. Resolve.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Bangladesh's civic issue reporting platform. Empowering citizens to improve 
              their neighborhoods through real-time communication with local authorities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/report"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Report an Issue
              </Link>
              <Link
                to="/my-reports"
                className="bg-white text-green-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition"
              >
                Track My Report
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.total.toLocaleString()}+</div>
              <div className="text-sm">Issues Reported</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.resolutionRate}%</div>
              <div className="text-sm">Resolution Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Report an Issue</h3>
            <p className="text-gray-600">
              Submit details, photos, and location of any civic issue you encounter.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Track Progress</h3>
            <p className="text-gray-600">
              Monitor your report as it moves through the resolution process.
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Get Resolution</h3>
            <p className="text-gray-600">
              Receive updates when your issue is resolved by local authorities.
            </p>
          </div>
        </div>
      </section>

      {/* Issue Categories Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Issue Categories</h2>
          <p className="text-center text-gray-600 mb-12">
            We handle a wide range of civic issues across urban areas.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`${cat.color} rounded-lg p-4 text-center hover:shadow-lg transition cursor-pointer`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold">{cat.name}</div>
                <div className="text-sm text-gray-600">{cat.count} reports</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Problems Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">What's happening near Dhaka right now</h2>
          <Link to="/problems" className="text-green-600 hover:text-green-700 font-semibold">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentProblems.map((problem) => (
            <div key={problem._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <img
                src={problem.media?.[0]?.url ? toAssetUrl(problem.media[0].url) : "https://via.placeholder.com/400x250?text=Issue"}
                alt={problem.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{problem.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ["submitted", "verified", "reopened"].includes(problem.status) ? 'bg-yellow-100 text-yellow-800' :
                    ["assigned", "in_progress", "pending_review"].includes(problem.status) ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {problem.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{problem.address || "Dhaka"}</p>
                <p className="text-gray-500 text-sm">{problem.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">⬆️ {problem.upvoteCount || 0} upvotes</span>
                  <Link to={`/problem/${problem._id}`} className="text-green-600 text-sm hover:underline">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Use CPRS Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why use CPRS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Faster Resolution</h3>
              <p className="text-green-100">
                Direct routing to authorities reduces response time by 40%
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">👁️</div>
              <h3 className="text-xl font-semibold mb-2">Full Transparency</h3>
              <p className="text-green-100">
                Track every step from submission to resolution
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-green-100">
                Join thousands of citizens improving their neighborhoods
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">CPRS vs Traditional Methods</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
              <h3 className="text-xl font-bold text-green-700 mb-4">✓ CPRS Platform</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time tracking and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Direct routing to relevant authorities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Photo and location evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Community upvoting system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Average resolution: 3.4 days</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-400 opacity-75">
              <h3 className="text-xl font-bold text-gray-500 mb-4">✗ Traditional Methods</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-500">
                  <span>✗</span>
                  <span>No progress tracking</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span>✗</span>
                  <span>Multiple phone calls required</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span>✗</span>
                  <span>No proof of submission</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span>✗</span>
                  <span>Individual complaints ignored</span>
                </li>
                <li className="flex items-start gap-2 text-gray-500">
                  <span>✗</span>
                  <span>Average resolution: 14+ days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">CPRS Bangladesh</h3>
              <p className="text-sm">
                A digital initiative by the Government of Bangladesh to bridge the gap 
                between citizens and local governance for a cleaner, safer nation.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/report" className="hover:text-white">Submit a Report</Link></li>
                <li><Link to="/problems" className="hover:text-white">Public Map</Link></li>
                <li><Link to="/my-reports" className="hover:text-white">Statistics Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 Government of Bangladesh - Civic Engagement Division. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}