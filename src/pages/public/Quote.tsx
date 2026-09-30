import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/app/providers/LangContext";
import { useSite } from "@/app/providers/SiteContext";
import { useAuth } from "@/app/providers/AuthContext";
import { quotesService } from "@/services";
import { useResource, errorMessage } from "@/lib/request";
import { buildWhatsAppUrl } from "@/lib/leadCapture";
import { LoadingState, Feedback } from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/shared/StatusPill";
import { QUOTE_STATUSES } from "@/lib/constants";
export default function Quote() {
  const { token } = useParams();
  const { lang } = useLang();
  const ar = lang === "ar";
  const { site } = useSite();
  const { user, loading: authLoading } = useAuth();
  const r = useResource(() => quotesService.getByToken(token || ""), [token]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const q = r.data;
  const mutable =
    q &&
    ["sent", "viewed", "under_discussion"].includes(q.status) &&
    user?.role !== "accounting";
  useEffect(() => {
    if (q?.status === "sent" && !user && !authLoading)
      void quotesService
        .getByToken(token!, "view")
        .then((value) => {
          if (value) r.setData(value);
        })
        .catch(() => {});
  }, [q?.status, token, user, authLoading]);
  async function act(action: "accept" | "discuss") {
    if (!mutable || busy) return;
    if (
      action === "accept" &&
      !window.confirm(
        ar
          ? "تأكيد الموافقة على عرض السعر؟ هذا لا يصدر حجزاً أو يدفع أي مبلغ."
          : "Accept this quote? This does not issue a booking or collect payment.",
      )
    )
      return;
    setBusy(true);
    setError("");
    let popup: Window | null = null;
    try {
      if (action === "discuss") {
        popup = window.open("about:blank", "_blank");
        if (popup) popup.opener = null;
      }
      const result = await quotesService.getByToken(token!, action);
      r.setData(result);
      if (popup)
        popup.location.replace(
          buildWhatsAppUrl(
            site.whatsapp_number,
            (ar
              ? "أرغب بمناقشة عرض السعر: "
              : "I would like to discuss quote: ") +
              q!.reference +
              "\n" +
              window.location.href,
          ),
        );
    } catch (e) {
      popup?.close();
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <LoadingState {...r} retry={r.reload} />
      {!r.loading &&
        !r.error &&
        (!q ? (
          <div className="empty-state">
            <h1>{ar ? "عرض السعر غير متاح" : "Quote unavailable"}</h1>
            <p className="mt-4">
              {ar
                ? "تحقق من الرابط المرسل لك أو تواصل مع فريق الرحلات."
                : "Check your link or contact our travel team."}
            </p>
          </div>
        ) : (
          <article className="panel max-w-3xl mx-auto">
            <div className="flex justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {ar ? "عرض السعر الخاص بك" : "Your personalised quotation"}
                </p>
                <h1 className="text-3xl font-bold mt-3">{q.reference}</h1>
              </div>
              <StatusPill status={q.status} meta={QUOTE_STATUSES} />
            </div>
            <p className="text-sm mb-6">
              {ar ? "صالح حتى: " : "Valid until: "}
              {q.valid_until}
            </p>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-start py-3">
                      {ar ? "الخدمة" : "Service"}
                    </th>
                    <th>{ar ? "الكمية" : "Qty"}</th>
                    <th>{ar ? "سعر الوحدة" : "Unit price"}</th>
                    <th>{ar ? "القيمة" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody>
                  {q.line_items.map((line, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td className="py-5 pe-3">
                        {ar ? line.label_ar || line.label : line.label}
                      </td>
                      <td className="text-center">{line.quantity}</td>
                      <td className="text-center">
                        {line.unit_price.toLocaleString("en-US")}
                      </td>
                      <td className="text-center">
                        {(line.quantity * line.unit_price).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[var(--secondary)] rounded-xl p-5 flex justify-between gap-4 my-7">
              <strong>{ar ? "الإجمالي" : "Total"}</strong>
              <strong dir="ltr">
                {q.total_price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                {q.currency}
              </strong>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-8">
              {ar ? q.notes_ar || q.notes : q.notes}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] my-5">
              {ar
                ? "الموافقة تعبر عن قبول العرض، ويؤكد فريق الرحلات الحجز والتوفر والترتيبات النهائية."
                : "Acceptance confirms your interest in these terms. Our travel team confirms availability, booking and final arrangements."}
            </p>
            <Feedback error={error} />
            {q.status === "expired" && (
              <Feedback
                error={
                  ar
                    ? "انتهت صلاحية هذا العرض. تواصل مع الفريق لتجديده."
                    : "This quote has expired. Contact our team for a renewal."
                }
              />
            )}
            <div className="flex flex-wrap gap-3 no-print">
              {mutable && (
                <>
                  <Button disabled={busy} onClick={() => act("accept")}>
                    {ar ? "الموافقة على العرض" : "Accept quote"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => act("discuss")}
                  >
                    {ar ? "مناقشة عبر واتساب" : "Discuss on WhatsApp"}
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => window.print()}>
                {ar ? "طباعة / PDF" : "Print / PDF"}
              </Button>
              <a
                href={buildWhatsAppUrl(
                  site.whatsapp_number,
                  (ar ? "بخصوص عرض السعر: " : "Regarding quote: ") +
                    q.reference,
                )}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-[var(--primary)]"
              >
                {ar ? "تواصل مع الفريق" : "Contact the team"}
              </a>
            </div>
            {q.status === "accepted" && (
              <Feedback
                message={
                  ar
                    ? "تم تسجيل موافقتك على عرض السعر."
                    : "Your acceptance has been recorded."
                }
              />
            )}
          </article>
        ))}
    </PublicLayout>
  );
}
