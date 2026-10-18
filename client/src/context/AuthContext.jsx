import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rf_user")) || null;
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(!!localStorage.getItem("rf_token"));
  const [dark, setDark] = useState(
    () => localStorage.getItem("rf_dark") === "true",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("rf_dark", dark);
  }, [dark]);

  // Validate stored token on boot
  useEffect(() => {
    if (!localStorage.getItem("rf_token")) {
      setBooting(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("rf_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const persist = ({ token, user }) => {
    localStorage.setItem("rf_token", token);
    localStorage.setItem("rf_user", JSON.stringify(user));
    setUser(user);
  };

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persist(data);
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persist(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rf_token");
    localStorage.removeItem("rf_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((u) => {
      const next = { ...u, ...partial };
      localStorage.setItem("rf_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        booting,
        dark,
        setDark,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
