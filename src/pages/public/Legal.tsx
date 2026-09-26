import { PublicLayout } from "@/components/public/PublicLayout"
import { useLang } from "@/app/providers/LangContext"

export default function Legal() {
  const { lang } = useLang()

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto prose prose-neutral">
        <h1>{lang === "ar" ? "السياسات القانونية" : "Legal Policies"}</h1>
        <p className="text-[var(--muted-foreground)]">
          {lang === "ar"
            ? "سيتم إضافة سياسة الخصوصية وشروط الاستخدام هنا."
            : "Privacy policy and terms of service will be added here."}
        </p>
      </div>
    </PublicLayout>
  )
}
