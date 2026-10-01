import { Link } from "react-router-dom"
import { useLang } from "@/app/providers/LangContext"
import { useSite } from "@/app/providers/SiteContext"
import { LanguageToggle } from "@/components/shared/LanguageToggle"

export function PublicNav() {
  const { lang } = useLang()
  const { site } = useSite()
  const ar = lang === "ar"

  return (
    <header className="public-nav">
      <div>
        {/* Brand */}
        <Link to="/" className="flex items-center shrink-0">
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet={site.logo_mobile_url || site.logo_url || "/assets/yahala-logo-light.png"}
            />
            <img
              src={site.logo_url || "/assets/yahala-logo-light.png"}
              alt={ar ? site.brand_name_ar : site.brand_name}
              className="h-9 w-auto max-w-[88px] object-contain sm:max-w-[150px]"
            />
          </picture>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageToggle className="!gap-1.5 !px-2.5 !py-1.5 text-xs sm:!px-4 sm:!py-2 sm:text-sm" />
          <Link
            to="/plan"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-2 text-xs font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90 sm:gap-1.5 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            {ar ? "خطط رحلتك" : "Plan a trip"}
            <span dir="ltr">→</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
