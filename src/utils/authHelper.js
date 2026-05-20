export const normalizeUser = (u) => {
  if (!u || typeof u !== "object") return null;
  const id = u._id ?? u.id;
  if (id == null || id === "") return null;
  const email = typeof u.email === "string" ? u.email.trim() : "";
  if (!email) return null;
  const rawRole = String(u.role ?? "citizen").trim().toLowerCase();
  const role = ["citizen", "admin", "authority", "field_worker", "moderator"].includes(rawRole)
    ? rawRole
    : "citizen";
  return {
    _id: id,
    id: String(id),
    name: u.name,
    email,
    role,
    phone: u.phone || "",
    departmentName: u.departmentName || "",
    profilePhoto: u.profilePhoto || "",
    team: u.team
      ? { _id: u.team._id ?? u.team.id ?? u.team, name: u.team.name || "" }
      : null,
  };
};

export const isAdminRole = (userOrRole) => {
  const r = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return String(r ?? "").trim().toLowerCase() === "admin";
};
