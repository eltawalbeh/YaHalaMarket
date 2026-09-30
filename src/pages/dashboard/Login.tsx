import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { useLang } from "@/app/providers/LangContext";
import { Button } from "@/components/ui/Button";
import { Feedback, Field, Icon } from "@/components/ui/Operations";
import { db, errorMessage } from "@/lib/request";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { assets } from "@/lib/assets";
export default function Login() {
  const { login, authError } = useAuth();
  const { lang } = useLang();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [reset, setReset] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (reset) {
        const { error } = await db().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setMessage(
          ar
            ? "إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور."
            : "If the email is registered, you will receive a reset link.",
        );
      } else {
        await login(email.trim(), password);
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-screen">
      <section className="login-visual">
        <img src={assets.loginCover} alt="" />
        <div className="login-story">
          <div className="w-[72px] h-[3px] bg-[#51c895] mb-5" />
          <h2>
            {ar
              ? "كل رحلة تبدأ بقرار واضح."
              : "Every journey starts with a clear decision."}
          </h2>
          <p>
            {ar
              ? "مساحة موحدة لفريق يا هلا لمتابعة الضيوف والعروض والشركاء من أول تواصل حتى تأكيد الرحلة."
              : "One workspace for Ya Hala to manage guests, offers and partners from first contact to confirmed travel."}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {(ar
              ? ["العروض", "العملاء", "الفريق"]
              : ["Offers", "Customers", "Team"]
            ).map((x) => (
              <div
                key={x}
                className="border border-white/20 rounded-xl bg-white/10 p-4 text-center"
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="login-form-side" dir={ar ? "rtl" : "ltr"}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div>
              <strong className="text-xl">يا هلا</strong>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                OPERATIONS
              </p>
            </div>
            <span className="brand-mark">
              <Icon file="4d609" />
            </span>
          </Link>
          <LanguageToggle />
        </div>
        <form className="login-form" onSubmit={submit}>
          <div>
            <h1>
              {reset
                ? ar
                  ? "استعادة كلمة المرور"
                  : "Reset password"
                : ar
                  ? "أهلاً بعودتك"
                  : "Welcome back"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-4">
              {ar
                ? "سجّل الدخول لمتابعة عمليات اليوم."
                : "Sign in to manage today’s operations."}
            </p>
          </div>
          <Field label={ar ? "البريد الإلكتروني" : "Email"}>
            <input
              autoComplete="username"
              dir="ltr"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {!reset && (
            <Field label={ar ? "كلمة المرور" : "Password"}>
              <div className="relative">
                <input
                  className="w-full pe-12"
                  autoComplete="current-password"
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute end-4 top-4"
                  aria-label={ar ? "إظهار كلمة المرور" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  <Icon file="9f93d" />
                </button>
              </div>
            </Field>
          )}
          <button
            type="button"
            onClick={() => {
              setReset(!reset);
              setError("");
              setMessage("");
            }}
            className="text-xs text-[var(--primary)] text-start"
          >
            {reset
              ? ar
                ? "العودة للدخول"
                : "Back to sign in"
              : ar
                ? "نسيت كلمة المرور؟"
                : "Forgot password?"}
          </button>
          <Feedback error={error || authError} message={message} />
          <Button type="submit" disabled={busy}>
            {busy
              ? ar
                ? "جارٍ التنفيذ…"
                : "Please wait…"
              : reset
                ? ar
                  ? "إرسال رابط الاستعادة"
                  : "Send reset link"
                : ar
                  ? "تسجيل الدخول"
                  : "Sign in"}
          </Button>
          <p className="text-[10px] text-center text-[var(--muted-foreground)]">
            {ar ? "جلسة مخصصة لموظفي يا هلا" : "Authorised Ya Hala employees"}
          </p>
        </form>
        <p className="text-[10px] text-[var(--muted-foreground)] text-center">
          © {new Date().getFullYear()} يا هلا
        </p>
      </section>
    </div>
  );
}
