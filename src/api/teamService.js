import api from "./api";

export const teamService = {
  createTeam: async (teamData) => {
    const response = await api.post("/teams", teamData);
    return response.data;
  },

  getTeams: async (page = 1, limit = 20) => {
    const response = await api.get("/teams", { params: { page, limit } });
    return response.data;
  },

  updateTeam: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  getTeamStats: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/stats`);
    return response.data;
  },
};
