import { apiRequest } from "../api/client";

export const accountService = {
  updateAccount: async (email: string, username: string) => apiRequest("/api/account", {
    method: "PATCH",
    body: JSON.stringify({ email, username }),
  }),
  changePassword: async (currentPassword: string, newPassword: string) => apiRequest("/api/account/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
  logoutAll: async () => apiRequest("/api/account/logout-all", { method: "POST" }),
  deleteAccount: async (password: string) => apiRequest("/api/account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  }),
};
