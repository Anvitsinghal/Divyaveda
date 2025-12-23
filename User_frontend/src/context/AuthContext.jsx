import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On refresh, check if token exists and is valid
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Optional: Check expiry here
            setUser(decoded); 
        } catch (e) {
            localStorage.removeItem('userToken');
        }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data; 
    localStorage.setItem('userToken', token);
    setUser(user); // or decode the token
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);