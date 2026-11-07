import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from '../services/authApi';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean; // true mientras se comprueba la sesión al cargar la página
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name?: string) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura la sesión desde la cookie al abrir o recargar la app
  useEffect(() => {
    authApi
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { user } = await authApi.login(email, password);
        setUser(user);
        return user;
      },
      register: async (email, password, name) => {
        const { user } = await authApi.register(email, password, name);
        setUser(user);
        return user;
      },
      loginWithGoogle: async (credential) => {
        const { user } = await authApi.google(credential);
        setUser(user);
        return user;
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};