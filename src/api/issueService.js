import api from "./api";

export const issueService = {
  getPublicFeed: async (page = 1, limit = 10, category = null) => {
    const params = { page, limit };
    if (category) params.category = category;
    const response = await api.get("/issues/public", { params });
    return response.data;
  },

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
    const response = await api.post("/issues", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateIssueStatus: async (issueId, statusData) => {
    const response = await api.put(`/issues/${issueId}/status`, statusData);
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
};
