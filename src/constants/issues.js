export const ALL_STATUSES = [
  "submitted",
  "verified",
  "assigned",
  "in_progress",
  "pending_review",
  "resolved",
  "reopened",
  "closed",
];

export const STATUS_LABELS = {
  submitted: { label: "Submitted", color: "bg-yellow-100 text-yellow-800", icon: "📋" },
  verified: { label: "Verified", color: "bg-blue-100 text-blue-800", icon: "✔️" },
  assigned: { label: "Assigned", color: "bg-purple-100 text-purple-800", icon: "👷" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-800", icon: "🔄" },
  pending_review: { label: "Pending Review", color: "bg-indigo-100 text-indigo-800", icon: "🔍" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: "✅" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700", icon: "🔒" },
  reopened: { label: "Reopened", color: "bg-red-100 text-red-800", icon: "⚠️" },
};

export const CATEGORY_LABELS = {
  road_transportation: { label: "Roads & Transport", icon: "🛣️" },
  water_sanitation: { label: "Water & Sanitation", icon: "💧" },
  electricity: { label: "Electricity", icon: "⚡" },
  waste_management: { label: "Waste Management", icon: "🗑️" },
  public_safety: { label: "Public Safety", icon: "🛡️" },
  environmental: { label: "Environmental", icon: "🌿" },
  other: { label: "Other", icon: "📌" },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, { label }]) => ({
  value,
  label,
}));

// Simple label getters for components
export const getStatusLabel = (status) => STATUS_LABELS[status]?.label || status;
export const getCategoryLabel = (category) => CATEGORY_LABELS[category]?.label || category;
export const getStatusColor = (status) => STATUS_LABELS[status]?.color || "bg-gray-100";
export const getCategoryIcon = (category) => CATEGORY_LABELS[category]?.icon || "📌";
export const getStatusIcon = (status) => STATUS_LABELS[status]?.icon || "";

