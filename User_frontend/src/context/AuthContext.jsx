import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async token => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("userToken");
        setUser(null);
        return;
      }
      const me = await api.get("/auth/me");
      setUser(me.data);
    } catch (e) {
      localStorage.removeItem("userToken");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      loadProfile(token);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [loadProfile]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token } = res.data;
    localStorage.setItem("userToken", token);
    await loadProfile(token);
  };

  const register = async payload => {
    await api.post("/auth/register", payload);
    await login(payload.email, payload.password);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);