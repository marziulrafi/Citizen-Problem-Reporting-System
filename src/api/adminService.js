import api from "./api";

export const adminService = {
  getAllUsers: async (page = 1, limit = 20, role = null) => {
    const params = { page, limit };
    if (role) params.role = role;
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getWorkers: async () => {
    const response = await api.get("/admin/workers");
    return response.data;
  },
};
