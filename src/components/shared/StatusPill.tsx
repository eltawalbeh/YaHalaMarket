import { useLang } from "@/app/providers/LangContext";
const tones: Record<string, string> = {
  green: "bg-[#e6f7ef] text-[#269878]",
  red: "bg-[#fdeef1] text-[#da6479]",
  yellow: "bg-[#fff4dc] text-[#b48939]",
  blue: "bg-[#e7f5fb] text-[#168abb]",
  gray: "bg-[#eef3f6] text-[#8097aa]",
  indigo: "bg-[#f0edff] text-[#8170da]",
  teal: "bg-[#e5f8f7] text-[#158c91]",
  purple: "bg-[#f0edff] text-[#8170da]",
};
export function StatusPill({
  status,
  meta,
}: {
  status: string;
  meta: Record<string, { label: string; label_ar: string; color: string }>;
}) {
  const { lang } = useLang();
  const m = meta[status];
  return (
    <span
      className={
        "inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] " +
        (tones[m?.color] || tones.gray)
      }
    >
      {m ? (lang === "ar" ? m.label_ar : m.label) : status}
    </span>
  );
}
