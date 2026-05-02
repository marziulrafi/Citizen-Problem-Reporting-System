import api from "./api";

export const commentService = {
 
  getComments: async (issueId) => {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  addComment: async (issueId, commentData) => {
    const response = await api.post(`/issues/${issueId}/comments`, commentData);
    return response.data;
  },
};

export const feedbackService = {
  submitFeedback: async (issueId, feedbackData) => {
    const response = await api.post(`/issues/${issueId}/feedback`, feedbackData);
    return response.data;
  },
};


export const notificationService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const params = { page, limit };
    if (unreadOnly) params.unreadOnly = true;
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  markAsRead: async (notificationIds = []) => {
    const response = await api.put("/notifications/read", {
      ids: notificationIds,
    });
    return response.data;
  },
};


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

  getEscalatedIssues: async () => {
    const response = await api.get("/admin/escalated");
    return response.data;
  },
};
