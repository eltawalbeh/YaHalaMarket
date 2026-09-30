import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicNav } from "./PublicNav";
import { useSite } from "@/app/providers/SiteContext";
import { useLang } from "@/app/providers/LangContext";
import { Icon } from "@/components/ui/Operations";
export function PublicLayout({ children }: { children: ReactNode }) {
  const { site } = useSite();
  const { lang } = useLang();
  const ar = lang === "ar";
  useEffect(() => {
    document.title = site.content[ar ? "seo_title_ar" : "seo_title"];
    let meta = document.querySelector("meta[name=description]");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      site.content[ar ? "seo_description_ar" : "seo_description"],
    );
  }, [site, ar]);
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="public-container flex-1">{children}</main>
      <footer className="public-footer">
        <div className="flex items-center gap-3">
          <span className="brand-mark">
            <Icon file="9782b" />
          </span>
          <div>
            <strong className="text-white text-lg">
              {ar ? site.brand_name_ar : site.brand_name}
            </strong>
            <p className="mt-1 text-[10px]">
              {ar ? site.footer_text_ar : site.footer_text}
            </p>
          </div>
        </div>
        <nav>
          <Link to="/offers">{ar ? "استكشاف الرحلات" : "Explore trips"}</Link>
          <Link to="/plan">{ar ? "خطط رحلتك" : "Plan a trip"}</Link>
          <Link to="/legal">{ar ? "الخصوصية والشروط" : "Privacy & terms"}</Link>
          <Link to="/login">{ar ? "دخول الموظفين" : "Staff login"}</Link>
          {site.contact_email && (
            <a href={"mailto:" + site.contact_email}>{site.contact_email}</a>
          )}
          {site.whatsapp_number && (
            <a
              href={"https://wa.me/" + site.whatsapp_number.replace(/\D/g, "")}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          )}
        </nav>
        <p>{ar ? site.office_address_ar : site.office_address}</p>
        <p className="mt-4">
          © {new Date().getFullYear()}{" "}
          {ar ? site.brand_name_ar : site.brand_name}
        </p>
      </footer>
    </div>
  );
}
