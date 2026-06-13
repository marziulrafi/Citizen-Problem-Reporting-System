import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import DashboardShell, { StatCard } from "../components/DashboardShell";
import { issueService } from "../api/issueService";
import { adminService } from "../api/adminService";
import { zoneService } from "../api/zoneService";
import { getStatusLabel, getCategoryLabel, CATEGORY_OPTIONS } from "../constants/issues";
import { detectZoneFromCoordinates } from "../constants/dhakaZones";
import AiModeratorBadges from "../components/AiModeratorBadges";
import AiIssueInsights from "../components/AiIssueInsights";
import { formatIssueDisplayAddress } from "../utils/issueLocation";

export default function ModeratorDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [zones, setZones] = useState([]);
  const [moderationNote, setModerationNote] = useState("Verified — legitimate civic report");
  const [overrideCategory, setOverrideCategory] = useState("");
  const [overridePriority, setOverridePriority] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes, zonesRes] = await Promise.all([
        adminService.getDashboardStats(),
        issueService.getIssuesForModeration(1, 50, search),
        zoneService.getZones(),
      ]);
      setStats(statsRes?.data?.stats);
      setIssues(issuesRes?.data?.issues || []);
      setZones(zonesRes?.data?.zones || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getIssueZone = (issue) => {
    if (issue.zoneLabel) return { id: issue.zone, name: issue.zoneLabel };
    const coords = issue.location?.coordinates;
    if (coords?.length >= 2) {
      const z = detectZoneFromCoordinates(coords[1], coords[0], zones);
      return z;
    }
    return null;
  };

  const openVerifyModal = async (issue) => {
    setSelectedIssue(issue);
    setSelectedAuthority("");
    setOverrideCategory(issue.category || issue.aiCategory || "other");
    setOverridePriority(issue.aiPriority || issue.priority || "medium");
    setShowVerifyModal(true);
    const zone = getIssueZone(issue);
    try {
      const res = await zoneService.getAuthorities(zone?.id || issue.zone || null);
      const list = res?.data?.authorities || [];
      setAuthorities(list);
      if (list.length === 1) setSelectedAuthority(list[0]._id);
    } catch {
      setAuthorities([]);
      toast.error("Could not load zone authorities");
    }
  };

  const submitVerify = async () => {
    if (!selectedAuthority) {
      toast.error("Select the zone authority for this location");
      return;
    }
    setProcessingId(selectedIssue._id);
    try {
      await issueService.verifyIssue(selectedIssue._id, {
        assignedTo: selectedAuthority,
        moderationNote: moderationNote.trim() || "Verified by moderator",
        categoryOverride: overrideCategory || undefined,
        priorityOverride: overridePriority || undefined,
      });
      toast.success("Verified and routed to zone authority");
      setShowVerifyModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (issue) => {
    setSelectedIssue(issue);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      toast.error("Rejection reason required (min 10 characters)");
      return;
    }
    setRejectingId(selectedIssue._id);
    try {
      await issueService.rejectIssue(selectedIssue._id, rejectReason);
      toast.success("Issue rejected");
      setShowRejectModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setRejectingId(null);
    }
  };

  const filtered = issues.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.title?.toLowerCase().includes(q) || i.issueId?.toLowerCase().includes(q);
  });

  return (
    <DashboardShell
      title="Moderator Dashboard"
      subtitle="Verify reports and route each issue to the correct Dhaka zone authority"
      icon="🛡️"
      accent="from-sky-900 via-blue-800 to-indigo-900"
      onRefresh={loadData}
      loading={loading}
    >
      <div className="mb-8 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-sm text-slate-700">
        <strong className="text-blue-900">Dhaka workflow:</strong> Review AI spam warnings → confirm map/address → assign to the{" "}
        <strong>zone authority</strong> (1 authority per zone, 3 field teams each). Citizens pin locations on the map for
        automatic zone detection.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="To Review" value={stats?.openIssues ?? 0} color="text-orange-600" />
        <StatCard icon="✅" label="Verified" value={stats?.resolvedIssues ?? 0} color="text-emerald-600" />
        <StatCard icon="📊" label="Total" value={stats?.totalIssues ?? 0} />
        <StatCard icon="🔍" label="In Queue" value={filtered.length} color="text-blue-600" />
      </div>

      <input
        type="search"
        placeholder="Search by title or issue ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
      />

      {filtered.length === 0 ? (
        <div className="card-elevated text-center py-16 text-slate-500">No issues awaiting review</div>
      ) : (
        <div className="space-y-6">
          {filtered.map((issue) => {
            const zone = getIssueZone(issue);
            return (
              <article key={issue._id} className="card-elevated p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <Link to={`/problem/${issue._id}`} className="font-semibold text-slate-900 hover:text-blue-600 text-lg">
                      {issue.title}
                    </Link>
                    <p className="text-xs text-slate-500">{issue.issueId}</p>
                  </div>
                  <span className="badge bg-orange-100 text-orange-800">{getStatusLabel(issue.status)}</span>
                </div>

                <AiModeratorBadges issue={issue} className="mb-3" />

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{issue.description}</p>

                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <span className="badge bg-slate-100">{getCategoryLabel(issue.category)}</span>
                  {zone && (
                    <span className="badge bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {zone.name}
                    </span>
                  )}
                  <span className="badge bg-blue-100 text-blue-800">{formatIssueDisplayAddress(issue) || "Dhaka"}</span>
                </div>

                {issue.address && (
                  <p className="text-xs text-slate-500 mb-3">📍 {issue.address}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openVerifyModal(issue)}
                    disabled={processingId === issue._id}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    Verify & route to authority
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectClick(issue)}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showVerifyModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Route to zone authority</h2>
            <p className="text-sm text-slate-600 mb-4">{selectedIssue.title}</p>

            {getIssueZone(selectedIssue) && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
                <strong>Detected zone:</strong> {getIssueZone(selectedIssue).name}
                <p className="text-xs text-emerald-700 mt-1">Select the authority responsible for this Dhaka zone.</p>
              </div>
            )}

            <label className="block text-sm font-semibold text-slate-700 mb-2">Zone authority *</label>
            {authorities.length === 0 ? (
              <p className="text-sm text-amber-700 mb-4">No authority for this zone. Run backend seed.</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {authorities.map((a) => (
                  <label
                    key={a._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedAuthority === a._id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="authority"
                      checked={selectedAuthority === a._id}
                      onChange={() => setSelectedAuthority(a._id)}
                    />
                    <div>
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.zoneLabel} · {a.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <AiIssueInsights issue={selectedIssue} compact />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category (override)</label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Priority (override)</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="emergency">Emergency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">Moderation note</label>
            <textarea
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4"
            />

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowVerifyModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitVerify}
                disabled={processingId === selectedIssue._id || !selectedAuthority}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {processingId === selectedIssue._id ? "Routing…" : "Verify & send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject issue</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (min 10 characters)..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 resize-none"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={rejectingId === selectedIssue._id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
