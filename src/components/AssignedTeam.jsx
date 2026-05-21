import { STATUS_LABELS } from "../constants/issues";

export default function AssignedTeam({ issue }) {
  const team = issue?.assignedTeam;
  const workers = issue?.assignedWorkers || [];
  const lead = issue?.assignedTo;

  if (!team?.name && workers.length === 0 && !lead?.name) {
    if (issue?.status === "verified") {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Waiting for authority to assign a worker team.
        </div>
      );
    }
    return null;
  }

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50/50 p-5">
      <h3 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
        <span>👷</span> Assigned worker team
      </h3>
      {team?.name && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm">
            {team.name}
          </span>
          {team.zone && <span className="ml-2 text-xs text-purple-700">{team.zone}</span>}
        </div>
      )}
      {lead?.name && (
        <p className="text-sm text-purple-800 mb-2">
          <span className="font-medium">Supervising authority:</span> {lead.name}
        </p>
      )}
      {workers.length > 0 && !team?.name && (
        <ul className="flex flex-wrap gap-2">
          {workers.map((w) => (
            <li key={w._id} className="text-xs font-medium bg-white border border-purple-200 text-purple-800 px-3 py-1.5 rounded-full">
              {w.name}
            </li>
          ))}
        </ul>
      )}
      {issue?.status && (
        <p className="text-xs text-purple-600 mt-3">
          Stage: {STATUS_LABELS[issue.status]?.label || issue.status}
        </p>
      )}
    </div>
  );
}
