import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getUsername,
  setMasterPassword,
  setUsername as persistUsername,
  verifyCredentials,
  verifyMasterPassword,
} from "../auth/localCredentials";
import { clearSession, isSessionActive, setSessionActive } from "../auth/session";

type AuthContextValue = {
  /** Sudah memasukkan username & password di sesi ini */
  isLoggedIn: boolean;
  /** Nama pengguna untuk masuk & tampilan */
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUsername: (name: string) => void;
  changeMasterPassword: (currentPassword: string, newPassword: string) => { ok: true } | { ok: false; error: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isSessionActive());
  const [username, setUsernameState] = useState(() => getUsername());

  const login = useCallback((user: string, password: string) => {
    if (!verifyCredentials(user, password)) return false;
    setSessionActive(true);
    setIsLoggedIn(true);
    setUsernameState(getUsername());
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
  }, []);

  const updateUsername = useCallback((name: string) => {
    persistUsername(name);
    setUsernameState(getUsername());
  }, []);

  const changeMasterPassword = useCallback(
    (currentPassword: string, newPassword: string): { ok: true } | { ok: false; error: string } => {
      const cur = currentPassword.trim();
      const next = newPassword.trim();
      if (!verifyMasterPassword(cur)) return { ok: false, error: "Password saat ini salah." };
      if (next.length < 4) return { ok: false, error: "Password baru minimal 4 karakter." };
      setMasterPassword(next);
      return { ok: true };
    },
    [],
  );

  const value = useMemo(
    () => ({
      isLoggedIn,
      username,
      login,
      logout,
      updateUsername,
      changeMasterPassword,
    }),
    [isLoggedIn, username, login, logout, updateUsername, changeMasterPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
