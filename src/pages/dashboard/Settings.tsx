import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageTitle, Field, Feedback } from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { usersService } from "@/services";
import { db, errorMessage } from "@/lib/request";
export default function Settings() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [nameAr, setNameAr] = useState(user?.full_name_ar || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(e: React.FormEvent, mode: "profile" | "password") {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "profile") {
        await usersService.update(user!.id, {
          full_name: name,
          full_name_ar: nameAr,
        });
        await refreshProfile();
      } else {
        if (password !== confirm)
          throw new Error(
            ar ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
          );
        const { error } = await db().auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setConfirm("");
      }
      setMessage(ar ? "تم حفظ التغييرات." : "Changes saved.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <DashboardLayout>
      <PageTitle title={ar ? "إعدادات الحساب" : "Account settings"} />
      <Feedback error={error} message={message} />
      <div className="grid lg:grid-cols-2 gap-5">
        <form className="panel grid gap-5" onSubmit={(e) => save(e, "profile")}>
          <h2>{ar ? "الملف الشخصي" : "Profile"}</h2>
          <Field label="Name">
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="الاسم بالعربية">
            <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </Field>
          <p className="text-sm text-[var(--muted-foreground)]">
            {user?.email}
          </p>
          <Button type="submit" disabled={busy}>
            {ar ? "حفظ الملف" : "Save profile"}
          </Button>
        </form>
        <form
          className="panel grid gap-5"
          onSubmit={(e) => save(e, "password")}
        >
          <h2>{ar ? "تغيير كلمة المرور" : "Change password"}</h2>
          <Field label={ar ? "كلمة مرور جديدة" : "New password"}>
            <input
              autoComplete="new-password"
              required
              minLength={12}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={ar ? "تأكيد كلمة المرور" : "Confirm password"}>
            <input
              autoComplete="new-password"
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {ar ? "تغيير كلمة المرور" : "Update password"}
          </Button>
        </form>
        <section className="panel">
          <h2>{ar ? "لغة العرض" : "Display language"}</h2>
          <LanguageToggle />
        </section>
      </div>
    </DashboardLayout>
  );
}
