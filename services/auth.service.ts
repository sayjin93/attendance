import { apiClient } from "./api-client";

interface AuthSession {
  isAuthenticated: boolean;
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export const authService = {
  login(credentials: { identifier: string; password: string }) {
    return apiClient.post<{ message: string }>("/api/auth/login", credentials);
  },

  logout() {
    return apiClient.post<{ message: string }>("/api/auth/logout");
  },

  getSession() {
    return apiClient.get<AuthSession>("/api/auth/session");
  },

  refresh() {
    return apiClient.post<{ message: string }>("/api/auth/refresh");
  },

  forgotPassword(data: { identifier: string }) {
    return apiClient.post<{ message: string }>("/api/auth/forgot-password", data);
  },

  resetPassword(data: { token: string; password: string }) {
    return apiClient.post<{ message: string }>("/api/auth/reset-password", data);
  },
};
