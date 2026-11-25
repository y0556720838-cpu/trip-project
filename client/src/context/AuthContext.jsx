import { createContext, useContext, useState } from 'react';
import { clearCache } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('currentUser'))
  );

  function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  }

  function logout() {
    localStorage.removeItem('currentUser');
    clearCache();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login: saveUser, updateUser: saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}