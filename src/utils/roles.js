export const ROLES = ["citizen", "admin", "authority", "field_worker", "moderator"];

export const ROLE_LABELS = {
    citizen: "Citizen",
    admin: "Administrator",
    authority: "Authority",
    field_worker: "Worker Team",
    moderator: "Moderator",
};

export const getDashboardPath = (role) => {
    const paths = {
        admin: "/dashboard",
        authority: "/authority",
        field_worker: "/worker",
        moderator: "/moderator",
        citizen: "/my-reports",
    };
    return paths[role] || "/";
};

export const isStaffRole = (role) =>
    ["admin", "authority", "field_worker", "moderator"].includes(String(role || "").toLowerCase());

export const canReportIssues = (role) => role === "citizen" || role === "admin";

/** Display label for field workers (uses team name when available). */
export const getRoleDisplayLabel = (user) => {
    if (!user) return "";
    if (user.role === "field_worker") {
        return user.team?.name ? `Worker ${user.team.name}` : user.name || ROLE_LABELS.field_worker;
    }
    if (user.role === "authority") {
        return user.zoneLabel ? `${user.zoneLabel} Authority` : user.name || ROLE_LABELS.authority;
    }
    return ROLE_LABELS[user.role] || user.name || user.role;
};
