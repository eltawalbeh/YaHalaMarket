import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageTitle,
  LoadingState,
  Field,
  Feedback,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { useSite } from "@/app/providers/SiteContext";
import { siteContentService, type SiteSettings } from "@/services/siteContent";
import { uploadImage } from "@/services/media";
import { useResource, errorMessage } from "@/lib/request";
export default function ContentManagement() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const site = useSite();
  const r = useResource(() => siteContentService.get());
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState("brand");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (r.data) setForm(r.data);
  }, [r.data]);
  const set = (key: keyof SiteSettings, value: string) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));
  const content = (key: string, value: string) =>
    setForm((f) => (f ? { ...f, content: { ...f.content, [key]: value } } : f));
  const field = (key: keyof SiteSettings, label: string, type = "text") => (
    <Field label={label}>
      <input
        type={type}
        value={String(form?.[key] || "")}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );
  const text = (key: string, label: string, large = false) => (
    <Field label={label}>
      {large ? (
        <textarea
          rows={6}
          value={form?.content[key] || ""}
          onChange={(e) => content(key, e.target.value)}
        />
      ) : (
        <input
          value={form?.content[key] || ""}
          onChange={(e) => content(key, e.target.value)}
        />
      )}
    </Field>
  );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !user) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { id, updated_at, updated_by, ...payload } = form;
      const saved = await siteContentService.update(payload, user.id);
      setForm(saved);
      await site.reload();
      setMessage(
        ar
          ? "تم حفظ ونشر التغييرات على الموقع."
          : "Changes saved and published to the website.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function image(file?: File) {
    if (!file || !user) return;
    setBusy(true);
    setError("");
    try {
      set("logo_url", await uploadImage(file, user.id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const tabs = [
    ["brand", "الهوية", "Brand"],
    ["home", "الصفحة الرئيسية", "Homepage"],
    ["plan", "خطط رحلتك", "Plan a trip"],
    ["footer", "الفوتر والتواصل", "Footer & contact"],
    ["seo", "إعدادات البحث", "SEO"],
    ["legal", "الخصوصية والشروط", "Privacy & terms"],
  ];
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "محتوى الموقع" : "Website content"}
        subtitle={
          ar
            ? "عدّل الهوية والنصوص والتواصل، ثم انشر التغييرات على الموقع."
            : "Edit branding, copy and contact details, then publish your changes."
        }
      >
        <Link
          className="rounded-xl bg-white border border-[var(--border)] px-4 py-2"
          to="/"
          target="_blank"
        >
          {ar ? "معاينة الموقع" : "Preview website"}
        </Link>
      </PageTitle>
      <LoadingState {...r} retry={r.reload} />
      {form && (
        <form onSubmit={save}>
          <div className="panel flex items-center justify-between gap-4 mb-5">
            <span className="text-xs text-[var(--muted-foreground)]">
              {form.updated_at
                ? new Date(form.updated_at).toLocaleString("en-GB")
                : ""}
            </span>
            <Button type="submit" disabled={busy}>
              {busy
                ? ar
                  ? "جارٍ الحفظ…"
                  : "Saving…"
                : ar
                  ? "حفظ ونشر التغييرات"
                  : "Save & publish"}
            </Button>
          </div>
          <Feedback error={error} message={message} />
          <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-5">
            <aside className="panel">
              <h2>{ar ? "هيكل الموقع" : "Site sections"}</h2>
              <div className="grid gap-2">
                {tabs.map(([key, arabic, en]) => (
                  <button
                    type="button"
                    key={key}
                    className={
                      "text-start p-3 rounded-xl " +
                      (tab === key
                        ? "bg-[var(--secondary)] text-[var(--primary)]"
                        : "hover:bg-[var(--muted)]")
                    }
                    onClick={() => setTab(key)}
                  >
                    {ar ? arabic : en}
                  </button>
                ))}
              </div>
            </aside>
            <section className="panel">
              <h2>{tabs.find((t) => t[0] === tab)?.[ar ? 1 : 2]}</h2>
              <div className="form-grid">
                {tab === "brand" && (
                  <>
                    {field("brand_name", "Brand name")}
                    {field("brand_name_ar", "اسم العلامة بالعربية")}
                    {field(
                      "logo_url",
                      ar ? "رابط اللوجو الرئيسي" : "Main logo URL",
                      "url",
                    )}
                    {field(
                      "logo_mobile_url",
                      ar ? "رابط لوجو الهاتف" : "Mobile logo URL",
                      "url",
                    )}
                    <Field label={ar ? "رفع اللوجو" : "Upload logo"}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        disabled={busy}
                        onChange={(e) => image(e.target.files?.[0])}
                      />
                    </Field>
                    {form.logo_url && (
                      <img
                        src={form.logo_url}
                        alt="Brand preview"
                        className="max-h-24 max-w-full object-contain"
                      />
                    )}
                  </>
                )}
                {tab === "home" && (
                  <>
                    {text("hero_title", "Main heading")}
                    {text("hero_title_ar", "العنوان الرئيسي")}
                    {text("hero_text", "Supporting copy", true)}
                    {text("hero_text_ar", "النص الداعم", true)}
                  </>
                )}
                {tab === "plan" && (
                  <>
                    {text("plan_title", "Plan page heading")}
                    {text("plan_title_ar", "عنوان خطط رحلتك")}
                    {text("plan_text", "Supporting copy", true)}
                    {text("plan_text_ar", "النص الداعم", true)}
                  </>
                )}
                {tab === "footer" && (
                  <>
                    {field("footer_text", "Footer text")}
                    {field("footer_text_ar", "نص الفوتر بالعربية")}
                    {field(
                      "contact_email",
                      ar ? "البريد الإلكتروني" : "Email",
                      "email",
                    )}
                    {field(
                      "whatsapp_number",
                      ar
                        ? "رقم الواتساب مع مفتاح الدولة"
                        : "WhatsApp with country code",
                      "tel",
                    )}
                    {field("office_address", "Office address")}
                    {field("office_address_ar", "عنوان المكتب بالعربية")}
                  </>
                )}
                {tab === "seo" && (
                  <>
                    {text("seo_title", "Page title")}
                    {text("seo_title_ar", "عنوان الصفحة بالعربية")}
                    {text("seo_description", "Meta description", true)}
                    {text("seo_description_ar", "وصف البحث بالعربية", true)}
                  </>
                )}
                {tab === "legal" && (
                  <>
                    {text("privacy", "Privacy information", true)}
                    {text("privacy_ar", "معلومات الخصوصية", true)}
                    {text("terms", "Service terms", true)}
                    {text("terms_ar", "شروط الخدمة", true)}
                  </>
                )}
              </div>
              {["home", "plan"].includes(tab) && (
                <div className="rounded-2xl bg-[var(--muted)] border border-[var(--border)] p-8 mt-6">
                  <p className="text-xs text-[var(--muted-foreground)] mb-4">
                    {ar ? "معاينة النص" : "Copy preview"}
                  </p>
                  <h3 className="text-3xl font-bold mb-3">
                    {
                      form.content[
                        tab === "home"
                          ? ar
                            ? "hero_title_ar"
                            : "hero_title"
                          : ar
                            ? "plan_title_ar"
                            : "plan_title"
                      ]
                    }
                  </h3>
                  <p className="text-[var(--muted-foreground)]">
                    {
                      form.content[
                        tab === "home"
                          ? ar
                            ? "hero_text_ar"
                            : "hero_text"
                          : ar
                            ? "plan_text_ar"
                            : "plan_text"
                      ]
                    }
                  </p>
                </div>
              )}
            </section>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
