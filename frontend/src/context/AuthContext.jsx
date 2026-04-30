import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("ridesync_token"));

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("ridesync_token");
    if (token) {
      getProfile()
        .then((res) => setUser(res.data))
        .catch(()  => { localStorage.removeItem("ridesync_token"); })
        .finally(() => setLoading(false));
    }
  }, []);

  const loginCtx = (userData) => {
    localStorage.setItem("ridesync_token", userData.token);
    setUser(userData);
  };

  const logoutCtx = () => {
    localStorage.removeItem("ridesync_token");
    setUser(null);
  };

  const updateUser = (userData) => {
    if (userData.token) localStorage.setItem("ridesync_token", userData.token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCtx, logoutCtx, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
