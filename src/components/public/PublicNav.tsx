import { Link } from "react-router-dom"
import { useLang } from "@/app/providers/LangContext"
import { useSite } from "@/app/providers/SiteContext"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { Icon } from "@/components/ui/Operations"

export function PublicNav() {
  const { lang } = useLang()
  const { site } = useSite()
  const ar = lang === "ar"

  return (
    <header className="public-nav">
      <div style={{ height: "68px" }}>
        {/* Brand */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/assets/yahala-logo-light.png"
            alt={ar ? site.brand_name_ar : site.brand_name}
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            to="/plan"
            className="rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity hidden sm:inline-flex items-center gap-1.5"
          >
            {ar ? "خطط رحلتك" : "Plan a trip"}
            <span dir="ltr">→</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
