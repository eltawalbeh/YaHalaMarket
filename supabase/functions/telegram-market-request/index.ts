import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const encoder = new TextEncoder();

async function hmacSha256(keyBytes: Uint8Array, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  let difference = 0;
  for (let i = 0; i < 64; i++) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

async function validateTelegramInitData(initData: string, botToken: string) {
  if (!initData || initData.length > 8192) return false;

  const params = new URLSearchParams(initData);
  const values = [...params.entries()];
  if (values.length === 0 || !params.has("hash")) return false;

  const seen = new Set<string>();
  for (const [key] of values) {
    if (seen.has(key)) return false;
    seen.add(key);
  }

  const receivedHash = params.get("hash") || "";
  const authDate = Number(params.get("auth_date"));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(authDate) || authDate > now + 30 || now - authDate > 86400) return false;

  const dataCheckString = values
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = await hmacSha256(encoder.encode("WebAppData"), botToken);
  const expectedHash = toHex(await hmacSha256(secretKey, dataCheckString));
  return constantTimeHexEqual(receivedHash, expectedHash);
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function notifyTeam(
  token: string,
  chatId: string | undefined,
  lead: Record<string, unknown>,
  details: { offerTitle: string; dates: string; budget: string; notes: string },
): Promise<"sent" | "failed" | "not_configured"> {
  if (!chatId) return "not_configured";

  const text = [
    "New Ya Hala Market lead",
    `Reference: ${cleanText(lead.reference_id, 40)}`,
    `Name: ${cleanText(lead.full_name, 160)}`,
    `Phone: ${cleanText(lead.phone, 40)}`,
    `Package: ${cleanText(details.offerTitle || "Custom trip", 180)}`,
    `Travel date: ${cleanText(details.dates || "Not specified", 200)}`,
    `Passengers: ${cleanText(lead.pax_count, 3)}`,
    `Budget: ${cleanText(details.budget || "Not specified", 120)}`,
    details.notes ? `Notes: ${cleanText(details.notes, 1000)}` : "",
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!response.ok) {
      console.warn("Telegram team notification failed with status", response.status);
      return "failed";
    }
    return "sent";
  } catch {
    console.warn("Telegram team notification request failed");
    return "failed";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const raw = await req.text();
    if (raw.length > 12000) return jsonResponse({ error: "Request too large" }, 413);

    const input = JSON.parse(raw);
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) return jsonResponse({ error: "Telegram is not configured" }, 503);

    if (
      typeof input.init_data !== "string" ||
      !(await validateTelegramInitData(input.init_data, botToken))
    ) {
      return jsonResponse({ error: "Open this form from Telegram and try again" }, 401);
    }

    const fullName = typeof input.full_name === "string" ? input.full_name.trim() : "";
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const notes = typeof input.notes === "string" ? input.notes.trim() : "";
    const budget = typeof input.budget_range === "string" ? input.budget_range.trim() : "";
    const dates = Array.isArray(input.preferred_dates) ? input.preferred_dates : [];
    const paxCount = input.pax_count;
    const offerId = input.offer_id || null;
    const submissionKey = input.submission_key;

    if (
      fullName.length < 2 || fullName.length > 160 ||
      phone.replace(/[^0-9]/g, "").length < 7 || phone.replace(/[^0-9]/g, "").length > 15 ||
      !Number.isInteger(paxCount) || paxCount < 1 || paxCount > 100 ||
      notes.length > 4000 || budget.length > 100 ||
      dates.length > 20 || dates.some((date) => typeof date !== "string" || date.length > 160) ||
      (offerId !== null && (typeof offerId !== "string" || !/^[0-9a-f-]{36}$/i.test(offerId))) ||
      typeof submissionKey !== "string" || !/^[0-9a-f-]{36}$/i.test(submissionKey)
    ) {
      return jsonResponse({ error: "Check the request details and try again" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase function secrets are not configured");
      return jsonResponse({ error: "Request service is not configured" }, 503);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.rpc("submit_telegram_market_request", {
      p_full_name: fullName,
      p_phone: phone,
      p_email: null,
      p_offer_id: offerId,
      p_notes: ["[Source: Telegram Mini App]", notes].filter(Boolean).join("\n"),
      p_pax_count: paxCount,
      p_preferred_dates: dates,
      p_budget_range: budget || null,
      p_submission_key: submissionKey,
    });

    if (error) return jsonResponse({ error: error.message }, 400);
    const lead = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
    if (!lead?.id || !lead.reference_id) {
      console.error("Telegram lead submission returned no lead");
      return jsonResponse({ error: "Unable to confirm the request" }, 500);
    }

    let offerTitle = "";
    if (offerId) {
      const { data: offer } = await admin.from("offers").select("title_ar,title").eq("id", offerId).maybeSingle();
      offerTitle = cleanText(offer?.title_ar || offer?.title, 180);
    }

    const notificationStatus = await notifyTeam(
      botToken,
      Deno.env.get("TELEGRAM_TEAM_CHAT_ID"),
      lead,
      {
        offerTitle,
        dates: dates.join(", "),
        budget,
        notes,
      },
    );

    return jsonResponse({ lead, notification_status: notificationStatus });
  } catch (error) {
    console.error("Unable to process Telegram market request", error);
    return jsonResponse({ error: "Unable to process the request" }, 400);
  }
});
