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

// Helper to get stored auth data
const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!stored.token && !!stored.user);
  const [isInitializing, setIsInitializing] = useState(true);

  // Simple validation on mount - just check if data exists
  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuth();
    const hasAuth = !!storedToken && !!storedUser;
    setIsAuthenticated(hasAuth);
    setIsInitializing(false);
    console.log("Auth check on mount:", hasAuth ? "Authenticated" : "Not authenticated");
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response.user.role !== "admin" && response.user.role !== "super_admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_user", JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
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
      setIsAuthenticated(false);
    }
  };

  const validateToken = async (): Promise<boolean> => {
    const { token: storedToken, user: storedUser } = getStoredAuth();
    if (!storedToken || !storedUser) return false;
    
    try {
      await authApi.validateToken();
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitializing,
    login,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
