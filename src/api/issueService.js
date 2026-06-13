import api from "./api";

export const issueService = {
  // Public
  getPublicFeed: async (page = 1, limit = 10, category = null) => {
    const params = { page, limit };
    if (category) params.category = category;
    const response = await api.get("/issues/public", { params });
    return response.data;
  },

  getCategoryStats: async () => {
    const response = await api.get("/issues/stats/categories");
    return response.data;
  },

  // Private
  getMyIssues: async (page = 1, limit = 100) => {
    const response = await api.get("/issues/my", { params: { page, limit } });
    return response.data;
  },

  getIssues: async (filters = {}) => {
    const params = { page: filters.page || 1, limit: filters.limit || 20, ...filters };
    const response = await api.get("/issues", { params });
    return response.data;
  },

  getIssueById: async (issueId) => {
    const response = await api.get(`/issues/${issueId}`);
    return response.data;
  },

  createIssue: async (formData) => {
    const response = await api.post("/issues", formData);
    return response.data;
  },

  updateIssueStatus: async (issueId, statusData) => {
    const response = await api.put(`/issues/${issueId}/status`, statusData);
    return response.data;
  },

  updateIssueStatusWithFiles: async (issueId, formData) => {
    const response = await api.put(`/issues/${issueId}/status`, formData);
    return response.data;
  },

  upvoteIssue: async (issueId) => {
    const response = await api.put(`/issues/${issueId}/upvote`);
    return response.data;
  },

  deleteIssue: async (issueId) => {
    const response = await api.delete(`/issues/${issueId}`);
    return response.data;
  },

  assignIssue: async (issueId, payload) => {
    const response = await api.put(`/issues/${issueId}/assign`, payload);
    return response.data;
  },

  getIssueHistory: async (issueId) => {
    const response = await api.get(`/issues/${issueId}/history`);
    return response.data;
  },

  getComments: async (issueId) => {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  addComment: async (issueId, text) => {
    const response = await api.post(`/issues/${issueId}/comments`, { text });
    return response.data;
  },

  // Moderation
  getIssuesForModeration: async (page = 1, limit = 20, search = "") => {
    const params = { page, limit };
    if (search) params.search = search;
    const response = await api.get("/moderation/issues", { params });
    return response.data;
  },

  verifyIssue: async (issueId, data) => {
    const response = await api.put(`/moderation/issues/${issueId}/verify`, data);
    return response.data;
  },

  rejectIssue: async (issueId, rejectionReason) => {
    const response = await api.put(`/moderation/issues/${issueId}/reject`, { rejectionReason });
    return response.data;
  },
};

