import { User } from "@/types/auth";

const API_BASE = "/api";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Invalid email or password");
    }

    return await response.json();
  },

  async signup(data: any): Promise<{ user: User | null; session: any }> {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
      email: data.email,
      password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
    });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Signup failed" }));
        throw new Error(error.detail || `Signup failed: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      return { user: userData, session: userData.session };
    } catch (error: any) {
      // Handle network errors
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Cannot connect to server. Make sure the backend is running on port 5000.");
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
    });
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // Get userId from localStorage (set on login)
    if (typeof window === "undefined") return null;
    
    const stored = localStorage.getItem("auth_user");
    if (!stored) return null;

    try {
      const user: User = JSON.parse(stored);
      // Verify user still exists in database
      const response = await fetch(`${API_BASE}/auth/me?userId=${user.id}`);
      if (response.ok) {
        const verified = await response.json();
        if (verified) {
          localStorage.setItem("auth_user", JSON.stringify(verified));
          return verified;
        }
      }
      // If verification fails, clear storage
      localStorage.removeItem("auth_user");
      return null;
    } catch {
      localStorage.removeItem("auth_user");
      return null;
    }
  },
};
