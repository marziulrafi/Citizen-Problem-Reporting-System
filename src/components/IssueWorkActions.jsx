import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { issueService } from "../api/issueService";
import { teamService } from "../api/teamService";
import { STATUS_LABELS } from "../constants/issues";
import { getDashboardPath, getRoleDisplayLabel } from "../utils/roles";

export default function IssueWorkActions({ issue, user, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [proofFiles, setProofFiles] = useState([]);
  const [resolutionNote, setResolutionNote] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamsLoaded, setTeamsLoaded] = useState(false);

  const role = user?.role;
  const actions = issue?.nextActions || [];

  const loadTeams = useCallback(async () => {
    if (teamsLoaded) return;
    try {
      const res = await teamService.getTeams(1, 50);
      setTeams(res?.data?.teams || []);
    } catch {
      setTeams([]);
    } finally {
      setTeamsLoaded(true);
    }
  }, [teamsLoaded]);

  const runStatus = async (status, withProof = false) => {
    setBusy(true);
    try {
      let res;
      if (withProof && proofFiles.length) {
        const fd = new FormData();
        fd.append("status", status);
        if (resolutionNote) fd.append("resolutionNote", resolutionNote);
        proofFiles.forEach((f) => fd.append("repairProof", f));
        res = await issueService.updateIssueStatusWithFiles(issue._id, fd);
      } else {
        const body = { status };
        if (resolutionNote && ["resolved", "closed"].includes(status)) body.resolutionNote = resolutionNote;
        res = await issueService.updateIssueStatus(issue._id, body);
      }
      toast.success(res.message || "Updated");
      onUpdated?.(res?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const assignTeam = async () => {
    if (!selectedTeam) {
      toast.error("Select a worker team");
      return;
    }
    setBusy(true);
    try {
      const res = await issueService.assignIssue(issue._id, { assignedTeam: selectedTeam });
      toast.success(res.message || "Team assigned");
      onUpdated?.(res?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setBusy(false);
    }
  };

  const canAssign =
    (role === "authority" || role === "admin") &&
    ["verified", "reopened", "assigned"].includes(issue.status);

  useEffect(() => {
    if (!user || !issue) return;
    if (canAssign && !teamsLoaded) loadTeams();
  }, [canAssign, teamsLoaded, loadTeams, user, issue]);

  if (!user || !issue) return null;

  const showPanel = actions.length > 0 || canAssign || role === "field_worker";
  if (!showPanel) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-bold">Your actions</h2>
        <Link to={getDashboardPath(role)} className="text-xs text-emerald-300 hover:text-emerald-200 underline">
          Open dashboard →
        </Link>
      </div>

      <p className="text-sm text-slate-300 mb-4">
        {getRoleDisplayLabel(user)} · {STATUS_LABELS[issue.status]?.label || issue.status}
      </p>

      {canAssign && (
        <div className="mb-4 p-4 rounded-xl bg-white/10 border border-white/20">
          <p className="text-sm font-semibold mb-3">Assign worker team</p>
          {teams.length === 0 ? (
            <p className="text-xs text-amber-200">No teams available. Run backend seed.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {teams.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setSelectedTeam(t._id)}
                    className={`p-2 rounded-lg border text-xs text-left transition ${
                      selectedTeam === t._id
                        ? "bg-purple-500 border-purple-400"
                        : "bg-white/10 border-white/30 hover:bg-white/20"
                    }`}
                  >
                    <span className="font-bold block">{t.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy || !selectedTeam}
                onClick={assignTeam}
                className="text-sm px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold disabled:opacity-50"
              >
                Assign team to this issue
              </button>
            </>
          )}
        </div>
      )}

      {role === "field_worker" && issue.status === "in_progress" && (
        <div className="mb-4 p-4 rounded-xl bg-white/10 border border-white/20">
          <p className="text-sm font-semibold mb-2">Upload repair proof (required for review)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setProofFiles(Array.from(e.target.files || []).slice(0, 3))}
            className="text-xs text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-emerald-500 file:text-white w-full"
          />
          {proofFiles.length > 0 && (
            <p className="text-xs text-emerald-300 mt-2">{proofFiles.length} photo(s) selected</p>
          )}
        </div>
      )}

      {["authority", "admin"].includes(role) && actions.includes("resolved") && (
        <div className="mb-4">
          <label className="text-xs text-slate-300 block mb-1">Resolution note (optional)</label>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            rows={2}
            className="w-full text-sm text-gray-900 rounded-lg px-3 py-2"
            placeholder="Describe approval or resolution..."
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map((status) => {
          const needsProof = role === "field_worker" && status === "pending_review";
          const label = STATUS_LABELS[status]?.label || status;
          return (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => runStatus(status, needsProof)}
              className="text-sm px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold disabled:opacity-50"
            >
              {label}
              {needsProof ? " (with photos)" : ""}
            </button>
          );
        })}
      </div>
    </section>
  );
}
