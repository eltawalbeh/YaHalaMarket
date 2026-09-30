import { chromium } from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const config = JSON.parse(
  await fs.readFile(process.env.YAHALA_QA_CONFIG, "utf8"),
);
const base = process.env.YAHALA_QA_URL || "http://127.0.0.1:5173";
const output = process.env.YAHALA_QA_OUTPUT || "/tmp/yahala-qa";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
const results = [];
page.on("pageerror", (e) => errors.push(e.message));
async function check(path, name) {
  await page.goto(base + path);
  await page.waitForLoadState("networkidle");
  await page.locator("h1").first().waitFor({ timeout: 22000 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  assert.equal(overflow, false, name + " horizontal overflow");
  const broken = await page
    .locator("img")
    .evaluateAll((imgs) =>
      imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
    );
  assert.deepEqual(broken, [], name + " broken images");
  await page.screenshot({ path: output + "/" + name + ".png", fullPage: true });
  results.push({
    page: name,
    url: page.url(),
    overflow,
    broken: broken.length,
  });
}
try {
  await check("/", "market");
  await check("/plan", "plan");
  await check("/login", "login");
  await page
    .getByLabel("البريد الإلكتروني")
    .fill(config.users.super_admin.email);
  await page
    .getByLabel("كلمة المرور", { exact: true })
    .fill(config.users.super_admin.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await page.waitForURL("**/dashboard", { timeout: 25000 });
  for (const [path, name] of [
    ["/dashboard", "overview"],
    ["/dashboard/offers", "offers"],
    ["/dashboard/offers/new", "wizard"],
    ["/dashboard/hotels", "hotels"],
    ["/dashboard/leads", "leads"],
    ["/dashboard/quotes", "quotes"],
    ["/dashboard/reports", "reports"],
    ["/dashboard/team", "team"],
    ["/dashboard/content", "content"],
    ["/dashboard/audit-log", "audit"],
    ["/dashboard/settings", "settings"],
  ])
    await check(path, name);
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(JSON.stringify({ passed: results.length, results, errors }));
} finally {
  await fs.writeFile(
    output + "/browser-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
}
