import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const externalBase = process.env.YAHALA_QA_URL;
const email = process.env.YAHALA_QA_ADMIN_EMAIL;
const password = process.env.YAHALA_QA_ADMIN_PASSWORD;
if (Boolean(email) !== Boolean(password)) {
  throw new Error("Set both YAHALA_QA_ADMIN_EMAIL and YAHALA_QA_ADMIN_PASSWORD to test dashboard pages.");
}
const output = process.env.YAHALA_QA_OUTPUT || "/tmp/yahala-qa";
await fs.mkdir(output, { recursive: true });
let server;
let base = externalBase;
if (!base) {
  server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    stdio: "ignore",
    env: process.env,
  });
  base = "http://127.0.0.1:4173";
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    if (server.exitCode !== null) throw new Error("Vite server stopped before becoming ready.");
    await delay(250);
  }
  assert.equal(ready, true, "Vite server did not become ready.");
}

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const results = [];
page.on("pageerror", (error) => errors.push(error.message));

async function check(path, name) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor({ timeout: 22000 });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode().catch(() => null))));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, name + " horizontal overflow");
  const broken = await page.locator("img").evaluateAll((images) => images.filter((image) => !image.complete || !image.naturalWidth).map((image) => image.src));
  assert.deepEqual(broken, [], name + " broken images");
  await page.screenshot({ path: output + "/" + name + ".png", fullPage: true });
  results.push({ page: name, url: page.url(), overflow, broken: broken.length });
}

try {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor({ timeout: 22000 });
  assert.equal(await page.locator('header.public-nav a[href="/plan"]').isVisible(), true, "Plan CTA must be visible on mobile.");
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(mobileOverflow, false, "Mobile market page horizontal overflow");
  results.push({ page: "mobile-market", url: page.url(), overflow: mobileOverflow, broken: 0 });

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [path, name] of [["/", "market"], ["/offers", "offers"], ["/plan", "plan"], ["/login", "login"], ["/legal", "legal"]]) {
    await check(path, name);
  }

  if (email && password) {
    await page.getByLabel(/البريد الإلكتروني|Email/i).fill(email);
    await page.getByLabel(/كلمة المرور|Password/i).fill(password);
    await page.getByRole("button", { name: /تسجيل الدخول|Sign in|Log in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 25000 });
    for (const [path, name] of [["/dashboard", "overview"], ["/dashboard/offers", "dashboard-offers"], ["/dashboard/offers/new", "offer-wizard"], ["/dashboard/hotels", "hotels"], ["/dashboard/leads", "leads"], ["/dashboard/quotes", "quotes"], ["/dashboard/reports", "reports"], ["/dashboard/team", "team"], ["/dashboard/content", "content"], ["/dashboard/audit-log", "audit"], ["/dashboard/settings", "settings"]]) {
      await check(path, name);
    }
  }

  assert.deepEqual(errors, [], "Browser runtime errors");
  const summary = { passed: results.length, results, errors };
  await fs.writeFile(output + "/browser-results.json", JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
} finally {
  await browser.close();
  server?.kill("SIGTERM");
}
