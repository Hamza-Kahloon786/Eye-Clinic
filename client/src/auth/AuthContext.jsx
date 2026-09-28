import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi, fetchMe } from '../api/authApi';
import { setOnUnauthorized } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then((me) => setUser(me))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  async function login(username, password) {
    const { token, user: loggedInUser } = await loginApi(username, password);
    localStorage.setItem('accessToken', token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
