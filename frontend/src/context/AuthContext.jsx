import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "cws_auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setAuthUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to read auth from localStorage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  function login(formData) {
    const mockUser = {
      token: "demo-token",
      id: "user-demo-001",
      fullName: formData.fullName || "Demo User",
      email: formData.email,
      role: "user",
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setAuthUser(mockUser);
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthUser(null);
  }

  const value = useMemo(
    () => ({
      authUser,
      isLoggedIn: Boolean(authUser?.token),
      login,
      logout,
    }),
    [authUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}