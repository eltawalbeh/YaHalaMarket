import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/app/providers/LangContext";
import { useSite } from "@/app/providers/SiteContext";
export default function Legal() {
  const { lang } = useLang();
  const { site } = useSite();
  const ar = lang === "ar";
  return (
    <PublicLayout>
      <article className="panel max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {ar ? "الخصوصية وشروط الخدمة" : "Privacy & service terms"}
        </h1>
        <h2>{ar ? "بياناتك وخصوصيتك" : "Your information"}</h2>
        <p className="whitespace-pre-wrap leading-8 text-sm mb-8">
          {site.content[ar ? "privacy_ar" : "privacy"]}
        </p>
        <h2>
          {ar ? "طلبات السفر وعروض الأسعار" : "Travel requests and quotations"}
        </h2>
        <p className="whitespace-pre-wrap leading-8 text-sm">
          {site.content[ar ? "terms_ar" : "terms"]}
        </p>
      </article>
    </PublicLayout>
  );
}
