import api from "./api";

export const aiService = {
  analyzeIssue: async (title, description) => {
    const response = await api.post("/ai/analyze-issue", { title, description });
    return response.data;
  },
};
