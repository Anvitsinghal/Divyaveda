import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  // Renamed to 'permissions' to be clear: These are what the USER can do
  const [permissions, setPermissions] = useState([]); 
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (token) => {
    try {
      const decoded = jwtDecode(token);
      // Check expiry
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      // 1. Get User Profile
      const me = await api.get("/auth/me");
      const userData = me.data;
      setAdmin(userData);

      // 2. EXTRACT PERMISSIONS (CRITICAL FIX)
      // Assuming backend sends: { user: { role: { screens: ['CATEGORY_VIEW', ...] } } }
      // If your backend structure is different, adjust this path.
      const userScreens = userData.role?.screens || userData.permissions || [];
      setPermissions(userScreens);

    } catch (e) {
      console.error("Auth Error:", e);
      localStorage.removeItem("adminToken");
      setAdmin(null);
      setPermissions([]);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        await loadProfile(token);
      }
      setLoading(false); // Now this waits for loadProfile to finish!
    };
    initAuth();
  }, [loadProfile]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token } = res.data;
    localStorage.setItem("adminToken", token);
    await loadProfile(token);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
    setPermissions([]);
  };

  // Helper to check permission easily in any component
  const canAccess = (screenName) => {
      return permissions.includes(screenName);
  };

  return (
    <AuthContext.Provider value={{ admin, permissions, canAccess, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AuthContext);