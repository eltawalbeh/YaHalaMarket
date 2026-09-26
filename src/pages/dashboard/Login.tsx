import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthContext"
import { Button } from "@/components/ui/Button"
import { DASHBOARD_ROUTES } from "@/lib/routes"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@yahala.co")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await login(email, password)
    navigate(DASHBOARD_ROUTES.home)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-3xl font-bold text-[var(--primary)]">يا هلا</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Operations Dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="(mock — any value)"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? "جارٍ الدخول…" : "تسجيل الدخول"}
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          Mock auth — no real credentials required
        </p>
      </div>
    </div>
  )
}
