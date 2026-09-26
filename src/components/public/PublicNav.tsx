import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useLang } from "@/app/providers/LangContext"
import { PUBLIC_ROUTES } from "@/lib/routes"

export function PublicNav() {
  const { lang, setLang } = useLang()
  const ar = lang === "ar"
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)] pt-3 pb-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          className={[
            "bg-[var(--card)] rounded-full h-14 px-4 sm:px-5",
            "flex items-center justify-between gap-3",
            "transition-all duration-300",
            scrolled
              ? "shadow-[0_8px_32px_rgba(0,0,0,0.13)]"
              : "shadow-[0_2px_10px_rgba(0,0,0,0.07)]",
          ].join(" ")}
        >
          {/* Brand */}
          <Link
            to={PUBLIC_ROUTES.market}
            className="shrink-0 font-display text-xl font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors leading-none"
          >
            يا هلا
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle — pill inside pill */}
            <div className="flex items-center rounded-full border border-[var(--border)] overflow-hidden text-sm select-none">
              <button
                onClick={() => setLang("ar")}
                aria-label="العربية"
                className={[
                  "px-3 py-1.5 transition-colors",
                  ar
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                ع
              </button>
              <button
                onClick={() => setLang("en")}
                aria-label="English"
                className={[
                  "px-3 py-1.5 text-xs tracking-widest uppercase transition-colors",
                  !ar
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                EN
              </button>
            </div>

            {/* CTA */}
            <Link
              to="/plan"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              {ar ? "خطط رحلتك" : "Plan a trip"}
              <span dir="ltr" className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
