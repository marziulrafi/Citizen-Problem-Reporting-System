import { RefreshCw } from "lucide-react";

export function StatCard({ icon, label, value, color = "text-slate-800", accent = "from-emerald-500/10 to-green-500/5" }) {
  return (
    <div className={`card-elevated p-5 bg-gradient-to-br ${accent}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function DashboardShell({
  title,
  subtitle,
  icon,
  onRefresh,
  loading,
  children,
  accent = "from-emerald-800 via-green-700 to-teal-800",
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className={`relative bg-gradient-to-r ${accent} text-white py-14 md:py-16`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl" />
        </div>
        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                <span className="text-4xl" aria-hidden>{icon}</span>
                {title}
              </h1>
              <p className="text-emerald-100/90 mt-2 text-sm md:text-base max-w-xl">{subtitle}</p>
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/25 transition-all border border-white/25 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-slate-50">
          <svg viewBox="0 0 1440 48" className="w-full h-8 md:h-10" preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0,32L80,29.3C160,27,320,21,480,26.7C640,32,800,48,960,48C1120,48,1280,32,1360,26.7L1440,21.3V48H0Z"
            />
          </svg>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8 max-w-6xl">{children}</div>
    </div>
  );
}
