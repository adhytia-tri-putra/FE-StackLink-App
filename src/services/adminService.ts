import { apiRequest } from "../api/client";

export const adminService = {
  async overview() { return (await apiRequest("/api/admin/overview")).data; },
  async updateUser(id: number, payload: { plan?: string; suspended?: boolean }) { return (await apiRequest(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) })).data; },
  async resolveReport(id: string) { return (await apiRequest(`/api/admin/reports/${id}/resolve`, { method: "PATCH" })).data; },
};
