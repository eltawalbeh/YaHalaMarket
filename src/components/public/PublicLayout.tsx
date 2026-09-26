import type { ReactNode } from "react"
import { PublicNav } from "./PublicNav"

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PublicNav />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-[var(--border)] mt-16 py-8 text-center text-sm text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} يا هلا ماركت · market.yahala.co
      </footer>
    </div>
  )
}
