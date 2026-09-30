import type { Lead, Quote } from "@/types";
export function reporting(
  leads: Lead[],
  quotes: Quote[],
  from: string,
  to: string,
  currency: string,
) {
  const inRange = (value: string) =>
    value.slice(0, 10) >= from && value.slice(0, 10) <= to;
  const periodLeads = leads.filter((l) => inRange(l.created_at));
  const periodQuotes = quotes.filter(
    (q) => inRange(q.created_at) && q.currency === currency,
  );
  const accepted = quotes.filter(
    (q) =>
      q.status === "accepted" &&
      q.currency === currency &&
      inRange(q.accepted_at || q.created_at),
  );
  const sources = Object.entries(
    periodLeads.reduce<Record<string, number>>((a, l) => {
      a[l.source] = (a[l.source] || 0) + 1;
      return a;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const grouped: Record<string, number> = {};
  for (const q of accepted) {
    const key = (q.accepted_at || q.created_at).slice(0, 7);
    grouped[key] = (grouped[key] || 0) + Number(q.total_price);
  }
  const shared = periodQuotes.filter(
    (q) => q.status !== "draft" && q.status !== "withdrawn",
  );
  return {
    periodLeads,
    periodQuotes,
    accepted,
    sources,
    series: Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)),
    value: accepted.reduce((s, q) => s + Number(q.total_price), 0),
    acceptance: shared.length
      ? (100 * shared.filter((q) => q.status === "accepted").length) /
        shared.length
      : 0,
    won: periodLeads.filter((l) => l.status === "sold").length,
  };
}
