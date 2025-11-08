import React, { createContext, useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient";

type User = {
  sub: string;
  iss: string;
  exp: number;
  email: string;
  userId: string;
  aud: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const REFRESH_BUFFER_MS = 60 * 1000;

function parseJwt(token: string | null): User | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("parseJwt error", e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(() =>
    parseJwt(localStorage.getItem(TOKEN_KEY))
  );
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  const clearScheduledRefresh = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current as number);
      refreshTimer.current = null;
    }
  };

  const scheduleRefresh = (rawToken: string | null) => {
    clearScheduledRefresh();
    if (!rawToken) return;
    const payload = parseJwt(rawToken) as any;
    if (!payload || !payload.exp) return;

    const expMs = payload.exp * 1000;
    const now = Date.now();
    const msUntilRefresh = expMs - now - REFRESH_BUFFER_MS;

    const timeout = msUntilRefresh > 0 ? msUntilRefresh : 0;

    refreshTimer.current = setTimeout(async () => {
      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) {
          logout();
          return;
        }
        const resp = await apiClient.post("/auth/refresh", { refreshToken });
        const newToken = resp.data?.token || resp.data?.accessToken || null;
        const newRefresh = resp.data?.refreshToken || null;
        if (newToken) {
          localStorage.setItem(TOKEN_KEY, newToken);
          if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
          setToken(newToken);
          setUser(parseJwt(newToken));
          scheduleRefresh(newToken);
        } else {
          logout();
        }
      } catch (e) {
        console.error("Automatic refresh failed", e);
        logout();
      }
    }, timeout) as unknown as ReturnType<typeof setTimeout>;
  };

  useEffect(() => {
    const handleStorage = () => {
      const t = localStorage.getItem(TOKEN_KEY);
      setToken(t);
      setUser(parseJwt(t));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    scheduleRefresh(token);
    return () => clearScheduledRefresh();
  }, [token]);

  useEffect(() => {
    const onLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", onLogout as EventListener);
    return () =>
      window.removeEventListener("auth:logout", onLogout as EventListener);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const resp = await apiClient.post("/auth/login", { username, password });
      const data = resp.data || {};
      const t = data.token || data.accessToken || null;
      const refresh = data.refreshToken || null;

      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
        if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
        setToken(t);
        setUser(parseJwt(t));
        scheduleRefresh(t);
      } else {
        throw new Error("Token no recibido del servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setUser(null);
    clearScheduledRefresh();
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
