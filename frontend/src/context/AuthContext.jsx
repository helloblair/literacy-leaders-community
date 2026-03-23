import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await client.get("/accounts/me/");
      if (res.data.authenticated === false) {
        setUser(null);
      } else {
        setUser(res.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password) => {
    const res = await client.post("/accounts/login/", { username, password });
    setUser(res.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await client.post("/accounts/register/", data);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await client.post("/accounts/logout/");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await client.patch("/accounts/profile/", data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
