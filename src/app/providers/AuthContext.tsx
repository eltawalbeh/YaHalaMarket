import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { mockCurrentUser } from '@/data';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // NOTE: Replace with real Supabase auth in a future phase
  const [user, setUser] = useState<User | null>(mockCurrentUser);

  const login = async (_email: string, _password: string) => {
    // TODO: Supabase auth.signInWithPassword
    setUser(mockCurrentUser);
  };

  const logout = () => {
    // TODO: Supabase auth.signOut
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
