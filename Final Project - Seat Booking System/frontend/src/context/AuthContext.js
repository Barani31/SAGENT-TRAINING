import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    localStorage.removeItem('sbs_user');
    return null;
  });

  const login = (userData) => {
    localStorage.setItem('sbs_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sbs_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isUser  = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);