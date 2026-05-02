import api from "./api";

export const issueService = {
  getPublicFeed: async (page = 1, limit = 10, category = null, lat = null, lng = null) => {
    const params = { page, limit };
    if (category) params.category = category;
    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
      params.radius = 10;
    }
    const response = await api.get("/issues/public", { params });
    return response.data;
  },

  getIssues: async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...filters,
    };
    const response = await api.get("/issues", { params });
    return response.data;
  },

  getIssueById: async (issueId) => {
    const response = await api.get(`/issues/${issueId}`);
    return response.data;
  },

  createIssue: async (formData) => {
    const response = await api.post("/issues", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateIssueStatus: async (issueId, statusData) => {
    const response = await api.put(`/issues/${issueId}/status`, statusData);
    return response.data;
  },

  updateIssueStatusWithProof: async (issueId, formData) => {
    const response = await api.put(`/issues/${issueId}/status`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  assignIssue: async (issueId, assignedTo) => {
    const response = await api.put(`/issues/${issueId}/assign`, { assignedTo });
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
