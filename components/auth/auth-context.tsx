import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '@/lib/auth';
import type { StoredSession } from '@/lib/auth';

type AuthContextValue = {
  session: StoredSession | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Sesión de administrador, persistida en SecureStore para sobrevivir a reinicios de la app.
// Los clientes normales de la app nunca inician sesión: isAdmin solo importa para gatear /admin.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .loadSession()
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    setSession(result);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAdmin: session?.role === 'ADMIN',
      login,
      logout,
    }),
    [session, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
