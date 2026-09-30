import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Field, Feedback } from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { db, errorMessage } from "@/lib/request";
import { useLang } from "@/app/providers/LangContext";
export default function ResetPassword() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(ar ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await db().auth.getSession();
      if (!data.session)
        throw new Error(
          ar
            ? "رابط الاستعادة غير صالح. اطلب رابطاً جديداً من صفحة الدخول."
            : "Reset link is invalid. Request a new one from the login page.",
        );
      const { error } = await db().auth.updateUser({ password });
      if (error) throw error;
      nav("/dashboard", { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <form onSubmit={save} className="panel max-w-lg mx-auto grid gap-5">
        <h1 className="text-2xl">{ar ? "كلمة مرور جديدة" : "New password"}</h1>
        <Field
          label={
            ar
              ? "كلمة المرور (12 حرفاً على الأقل)"
              : "Password (at least 12 characters)"
          }
        >
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label={ar ? "تأكيد كلمة المرور" : "Confirm password"}>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <Feedback error={error} />
        <Button type="submit" disabled={busy}>
          {busy ? "…" : ar ? "حفظ كلمة المرور" : "Save password"}
        </Button>
      </form>
    </PublicLayout>
  );
}
