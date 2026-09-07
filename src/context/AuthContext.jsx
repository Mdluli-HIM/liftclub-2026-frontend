import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, signup as signupRequest, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // On app load, re-check with the server rather than trusting the cached copy forever.
  // This is what catches admin actions (approve/reject) taken while the user wasn't looking.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getMe()
      .then((data) => {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await loginRequest({ email, password });
    saveSession(data);
    return data.user;
  }

  async function signup(payload) {
    const data = await signupRequest(payload);
    saveSession(data);
    return data.user;
  }

  async function refreshUser() {
    const data = await getMe();
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
