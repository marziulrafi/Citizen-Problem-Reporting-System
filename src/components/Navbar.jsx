import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/problems", label: "Problems", icon: "📋" },
    { path: "/report", label: "Report", icon: "📝" },
  ];

  const protectedLinks = [
    { path: "/my-reports", label: "My Reports", icon: "📊", role: "citizen" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin", icon: "⚙️", role: "admin" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md shadow-lg"
            : "bg-gradient-to-r from-gray-900 to-gray-800"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-sm font-bold">CPRS</span>
              </div>
              <div>
                <div className="font-bold text-white text-lg">
                  CPRS <span className="text-green-400">Bangladesh</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-none hidden sm:block">
                  Citizen Problem Reporting System
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}

              {user && (
                <NavLink
                  to="/my-reports"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span>📊</span>
                  <span>My Reports</span>
                </NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span>⚙️</span>
                  <span>Admin Dashboard</span>
                </NavLink>
              )}

              {/* Auth Section */}
              <div className="ml-4 pl-4 border-l border-gray-700">
                {!user ? (
                  <Link
                    to="/login"
                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-sm font-semibold text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <span>🔑</span>
                    <span>Login</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Welcome</div>
                      <div className="text-sm font-semibold text-white">
                        {user.name || user.email.split("@")[0]}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-red-500/30"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-1.5"
            >
              <span
                className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 transform ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border-t border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-3 ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}

              {user && (
                <NavLink
                  to="/my-reports"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-3 ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-xl">📊</span>
                  <span>My Reports</span>
                </NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-3 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-xl">⚙️</span>
                  <span>Admin Dashboard</span>
                </NavLink>
              )}

              <div className="border-t border-gray-700 my-2 pt-4">
                {!user ? (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-base font-semibold text-white flex items-center justify-center gap-2"
                  >
                    <span>🔑</span>
                    <span>Login</span>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="px-4 py-2 bg-white/10 rounded-lg">
                      <div className="text-xs text-gray-400">Logged in as</div>
                      <div className="text-white font-semibold">
                        {user.name || user.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 border border-red-500/30"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}