import { Link } from "react-router-dom";
import { useLang } from "@/app/providers/LangContext";
import { useSite } from "@/app/providers/SiteContext";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
export function PublicNav() {
  const { lang } = useLang();
  const { site } = useSite();
  return (
    <header className="public-nav">
      <div>
        <Link to="/" className="flex flex-col items-center">
          {site.logo_url ? (
            <picture>
              <source
                media="(max-width:640px)"
                srcSet={site.logo_mobile_url || site.logo_url}
              />
              <img
                src={site.logo_url}
                alt={lang === "ar" ? site.brand_name_ar : site.brand_name}
                className="max-w-[150px] h-9 object-contain"
              />
            </picture>
          ) : (
            <>
              <strong className="text-xl">
                {lang === "ar" ? site.brand_name_ar : site.brand_name}
              </strong>
              <small className="text-[10px] text-[var(--muted-foreground)]">
                Travel & Tourism
              </small>
            </>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            to="/plan"
            className="rounded-xl bg-[var(--primary)] text-white px-4 py-2 text-sm"
          >
            {lang === "ar" ? "خطط رحلتك" : "Plan a trip"} <span>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
