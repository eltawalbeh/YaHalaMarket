import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { db, request, errorMessage } from "@/lib/request";
type AuthValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
const Context = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const seq = useRef(0);
  async function profile(id: string) {
    const p = (await request(
      db().from("profiles").select("*").eq("id", id).single(),
    )) as User;
    if (!p?.is_active)
      throw new Error(
        "الحساب غير مفعل. تواصل مع مدير النظام. / Account is inactive.",
      );
    return p;
  }
  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = db().auth.onAuthStateChange((_event, session) => {
      const version = ++seq.current;
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      setTimeout(() => {
        if (!active || version !== seq.current) return;
        void profile(session.user.id)
          .then((p) => {
            if (active && version === seq.current) {
              setUser(p);
              setAuthError("");
            }
          })
          .catch((e) => {
            if (active && version === seq.current) {
              setUser(null);
              setAuthError(errorMessage(e));
            }
          })
          .finally(() => {
            if (active && version === seq.current) setLoading(false);
          });
      }, 0);
    });
    const timer = setTimeout(() => {
      if (active) setLoading(false);
    }, 17000);
    return () => {
      active = false;
      seq.current++;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);
  async function login(email: string, password: string) {
    setAuthError("");
    const { data, error } = await db().auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw new Error(
        error.message === "Invalid login credentials"
          ? "البريد أو كلمة المرور غير صحيحة / Invalid email or password"
          : error.message,
      );
    if (!data.user) throw new Error("Sign-in failed");
    const p = await profile(data.user.id);
    seq.current++;
    setUser(p);
    setLoading(false);
  }
  async function logout() {
    const { error } = await db().auth.signOut({ scope: "local" });
    seq.current++;
    setUser(null);
    setLoading(false);
    if (error) setAuthError(error.message);
  }
  async function refreshProfile() {
    if (user) setUser(await profile(user.id));
  }
  return (
    <Context.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
