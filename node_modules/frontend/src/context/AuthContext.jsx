import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return setLoading(false);
    api.get('/users/me')
      .then((r) => setUser(r.data))
      .catch(() => {
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function registerManager(payload) {
    const { data } = await api.post('/auth/register-manager', payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function acceptInvite({ token, email, password }) {
    const { data } = await api.post('/auth/accept-invite', { token, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }

  const value = { user, loading, login, logout, registerManager, acceptInvite };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
