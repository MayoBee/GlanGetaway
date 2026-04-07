// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "super_admin" | "resort_owner" | "front_desk" | "housekeeping" | "user";
  isActive?: boolean;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

// Login request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
  redirectUrl?: string;
}
