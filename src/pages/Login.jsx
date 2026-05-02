import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  // Load remembered credentials on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedUserType = localStorage.getItem("rememberedUserType");
    
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedUserType) {
      setUserType(rememberedUserType);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    // For demo, password is not strictly validated
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      let isValid = false;
      let userData = null;

      if (userType === "citizen") {
        // Citizen login - accept any valid email format for demo
        if (email.includes("@") && (email.endsWith(".com") || email.endsWith(".bd") || email.endsWith(".org"))) {
          isValid = true;
          userData = {
            email: email,
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
            role: "citizen"
          };
        } else {
          toast.error("Invalid email format");
          setAttempts(prev => prev + 1);
        }
      } else {
        // Admin login - only specific admin emails
        const adminEmails = [
          "admin@cprs.gov.bd",
          "admin@example.com", 
          "officer@cprs.gov.bd",
          "admin@cprs.com",
          "superadmin@cprs.gov.bd"
        ];
        
        if (adminEmails.includes(email.toLowerCase())) {
          isValid = true;
          userData = {
            email: email,
            name: "Administrator",
            role: "admin"
          };
        } else {
          toast.error("Invalid admin credentials");
          setAttempts(prev => prev + 1);
        }
      }

      if (isValid && userData) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedUserType", userType);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedUserType");
        }
        
        // Call login from AuthContext
        login(email, userData);
      } else if (attempts >= 2) {
        toast.error("Too many failed attempts. Please try again later.");
        setEmail("");
        setPassword("");
        setAttempts(0);
      }
      
      setIsLoading(false);
    }, 800);
  };

  const demoAccounts = [
    { type: "citizen", email: "rahim@example.com", name: "Rahim", role: "Citizen User", icon: "👤" },
    { type: "citizen", email: "fatema@example.com", name: "Fatema", role: "Citizen User", icon: "👤" },
    { type: "citizen", email: "karim@example.com", name: "Karim", role: "Citizen User", icon: "👤" },
    { type: "admin", email: "admin@cprs.gov.bd", name: "Admin", role: "Administrator", icon: "👑" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center py-12 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl">🇧🇩</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            CPRS Bangladesh
          </h1>
          <p className="text-gray-600 mt-2">Citizen Problem Reporting System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 md:p-8">
            {/* User Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
              <button
                onClick={() => setUserType("citizen")}
                className={`flex-1 py-2 rounded-md font-semibold transition-all duration-300 ${
                  userType === "citizen"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👤 Citizen Login
              </button>
              <button
                onClick={() => setUserType("admin")}
                className={`flex-1 py-2 rounded-md font-semibold transition-all duration-300 ${
                  userType === "admin"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                👑 Authority Login
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                    📧
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      userType === "citizen"
                        ? "citizen@example.com"
                        : "admin@cprs.gov.bd"
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                    🔒
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <a href="#" className="text-xs text-green-600 hover:text-green-700 transition-colors">
                    Forgot Password?
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                {attempts > 0 && attempts < 3 && (
                  <span className="text-xs text-red-500">
                    {3 - attempts} attempts remaining
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  userType === "citizen"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transform hover:scale-[1.02]"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-[1.02]"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>🔑</span>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="space-y-2">
              <p className="text-xs text-center text-gray-500 mb-3">
                Demo Accounts (Click to auto-fill)
              </p>
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEmail(account.email);
                    setUserType(account.type);
                    setPassword("password123");
                  }}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-3 border border-gray-200 hover:border-green-300 hover:shadow-md"
                >
                  <span className="text-2xl">{account.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-800">
                      {account.role}
                    </div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                  <span className="text-gray-400 group-hover:text-green-500">→</span>
                </button>
              ))}
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                  Register your division
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-x-4">
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <span className="text-xs text-gray-400">•</span>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Terms of Service
          </a>
          <span className="text-xs text-gray-400">•</span>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Help Center
          </a>
        </div>

        {/* System Status */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Online • Secure Connection
          </div>
        </div>
      </div>
    </div>
  );
}