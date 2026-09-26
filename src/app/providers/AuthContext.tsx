import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import type { User } from "@/types"
import { mockCurrentUser } from "@/data"
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function fallbackUser(): User {
  return mockCurrentUser
}

async function profileFor(authUser: SupabaseUser): Promise<User> {
  const { data, error } = await supabase!
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single()
  if (error) throw error
  return data as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    isSupabaseConfigured ? null : fallbackUser(),
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    let active = true
    const restore = async (session: Session | null) => {
      if (!active) return
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        setUser(await profileFor(session.user))
      } finally {
        if (active) setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => restore(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void restore(session)
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!supabase) {
      setUser(fallbackUser())
      return
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) setUser(await profileFor(data.user))
  }

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
