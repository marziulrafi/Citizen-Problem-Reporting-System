import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/roles";
import toast from "react-hot-toast";

const ROLE_OPTIONS = [
  { value: "citizen", label: "Citizen", role: "citizen", emailHint: "citizen@example.com", passwordHint: "Citizen@123" },
  { value: "field_worker", label: "Worker Team", role: "field_worker", emailHint: "gulshan.team1@cprs.gov.bd", passwordHint: "Team@12345" },
  { value: "authority", label: "Authority", role: "authority", emailHint: "auth.gulshan@cprs.gov.bd", passwordHint: "Authority@123" },
  { value: "moderator", label: "Moderator", role: "moderator", emailHint: "moderator@cprs.gov.bd", passwordHint: "Moderator@123" },
  { value: "admin", label: "Administrator", role: "admin", emailHint: "admin@cprs.gov.bd", passwordHint: "Admin@12345" },
];

export default function Login() {
  const { login, isAuthLoading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem("rememberedEmail")));

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === userType) || ROLE_OPTIONS[0];

  useEffect(() => {
    if (!user) return;
    navigate(getDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (rememberMe) localStorage.setItem("rememberedEmail", email);
    else localStorage.removeItem("rememberedEmail");

    const result = await login(email, password, selectedRole.role);
    if (!result.success) {
      setPassword("");
      return;
    }
    if (result.user) navigate(getDashboardPath(result.user.role), { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg mb-4 text-white font-bold text-lg">
            CPRS
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600 mt-1">Sign in with your zone email for your role</p>
        </div>

        <div className="card-elevated p-6 md:p-8 shadow-xl">
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">I am signing in as</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUserType(opt.value)}
                  disabled={isAuthLoading}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                    userType === opt.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              {userType === "field_worker" && (
                <>Use your team email, e.g. <strong>mirpur.team2@cprs.gov.bd</strong></>
              )}
              {userType === "authority" && (
                <>Use your zone authority email, e.g. <strong>auth.dhanmondi@cprs.gov.bd</strong></>
              )}
              {userType === "citizen" && <>Citizens use any registered email</>}
              {userType === "moderator" && <>Single moderator account for all Dhaka zones</>}
              {userType === "admin" && <>System administrator account</>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole.emailHint}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                disabled={isAuthLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={selectedRole.passwordHint}
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  disabled={isAuthLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-sm text-slate-600">Remember email</span>
            </label>
            <button type="submit" disabled={isAuthLoading} className="w-full btn-primary py-3">
              {isAuthLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New citizen?{" "}
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
