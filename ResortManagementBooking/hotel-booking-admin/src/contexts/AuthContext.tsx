import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthContextType } from "../types/auth";
import { authApi } from "../utils/api-client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      setIsLoading(false);
      return false;
    }

    try {
      await authApi.validateToken();
      setToken(storedToken);
      setIsLoading(false);
      return true;
    } catch (error) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login(email, password);
      
      // Check if user is admin
      if (response.user.role !== "admin" && response.user.role !== "super_admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_user", JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
