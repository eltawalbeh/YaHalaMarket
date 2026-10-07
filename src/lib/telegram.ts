export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramWebAppUser; start_param?: string };
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink?: (url: string) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function telegramWebApp() {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramMiniApp() {
  const app = telegramWebApp();
  if (!app) return null;
  app.ready();
  app.expand();
  try {
    app.setHeaderColor?.("#ffffff");
    app.setBackgroundColor?.("#ffffff");
  } catch {}
  return app;
}

export function telegramUser() {
  return telegramWebApp()?.initDataUnsafe?.user ?? null;
}

export function telegramStartParam() {
  return telegramWebApp()?.initDataUnsafe?.start_param ?? "";
}

export function isTelegramMiniApp() {
  return Boolean(telegramWebApp()?.initData);
}
