import api from "./api";

export const zoneService = {
  getZones: async () => {
    const response = await api.get("/zones");
    return response.data;
  },

  getAuthorities: async (zoneId = null) => {
    const params = zoneId ? { zone: zoneId } : {};
    const response = await api.get("/zones/authorities", { params });
    return response.data;
  },
};
