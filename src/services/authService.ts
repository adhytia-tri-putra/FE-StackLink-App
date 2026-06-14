import { apiRequest } from "../api/client";

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
  token: string;
}

const STORAGE_KEY = "stacklink_token";

export const authService = {
  getToken: () => localStorage.getItem(STORAGE_KEY),
  setToken: (token: string) => localStorage.setItem(STORAGE_KEY, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEY),

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.success) {
      throw new Error(response.message || "Login gagal");
    }

    const { user, token } = response.data;
    authService.setToken(token);

    return {
      user,
      token,
    };
  },

  register: async (username: string, name: string, email: string, password: string) => {
    const response = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, name, email, password }),
    });

    if (!response.success) {
      throw new Error(response.message || "Registrasi gagal");
    }

    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ developmentToken?: string }> => {
    const response = await apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return response.data || {};
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiRequest("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  logout: async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      authService.clearToken();
    }
  },
};
