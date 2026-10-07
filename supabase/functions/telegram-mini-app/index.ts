import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const encoder = new TextEncoder();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function hmac(key: Uint8Array | string, data: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", typeof key === "string" ? encoder.encode(key) : key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}
const hex = (bytes: Uint8Array) => [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function verifyInitData(initData: string, token: string) {
  const params = new URLSearchParams(initData);
  const signature = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  const userRaw = params.get("user");
  if (!signature || !userRaw || !authDate || Date.now() / 1000 - authDate > 86400) return null;
  const check = [...params.entries()].filter(([key]) => key !== "hash").sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = await hmac("WebAppData", token);
  if (hex(await hmac(secret, check)) !== signature) return null;
  try { return JSON.parse(userRaw) as { id: number; first_name?: string; last_name?: string }; } catch { return null; }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const input = await request.json();
    if (typeof input?.initData !== "string") return json({ error: "Telegram verification is required" }, 401);
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!token) return json({ error: "Telegram bot is not configured" }, 503);
    const user = await verifyInitData(input.initData, token);
    if (!user) return json({ error: "Telegram session is invalid or expired" }, 401);
    const fullName = String(input.fullName || "").trim(); const phone = String(input.phone || "").trim(); const notes = String(input.notes || "").trim();
    const offerId = String(input.offerId || ""); const travellers = Number(input.travellers || 1); const dates = String(input.dates || "").trim();
    if (fullName.length < 2 || fullName.length > 160 || !/^[+0-9 ()-]{7,25}$/.test(phone) || !/^[0-9a-f-]{36}$/i.test(offerId) || !Number.isInteger(travellers) || travellers < 1 || travellers > 20 || notes.length > 4000 || dates.length > 160) return json({ error: "Please check the submitted details" }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { count } = await admin.from("leads").select("id", { count: "exact", head: true }).eq("source", "telegram").eq("telegram_user_id", user.id).gt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count || 0) >= 5) return json({ error: "Too many requests. Please try again later." }, 429);
    const { data: offer } = await admin.from("offers").select("id,title,title_ar").eq("id", offerId).eq("status", "published").or("expires_at.is.null,expires_at.gt." + new Date().toISOString()).maybeSingle();
    if (!offer) return json({ error: "This offer is no longer available" }, 404);
    const reference = `YHT-${Date.now().toString(36).toUpperCase()}-${user.id.toString(36).toUpperCase()}`;
    const { error } = await admin.from("leads").insert({ full_name: fullName, phone, status: "new", source: "telegram", offer_id: offerId, notes: [`Telegram: ${user.id}`, `Offer: ${offer.title_ar || offer.title}`, dates && `Dates: ${dates}`, notes].filter(Boolean).join("\n"), pax_count: travellers, preferred_dates: dates ? [dates] : [], reference_id: reference, telegram_user_id: user.id });
    if (error) throw error;
    return json({ reference });
  } catch (error) { console.error(error); return json({ error: "Unable to submit your request" }, 500); }
});
