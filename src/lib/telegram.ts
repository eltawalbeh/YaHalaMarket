export type TelegramWebApp = {
  initData: string;
  ready(): void;
  expand(): void;
  close(): void;
  MainButton: {
    setText(text: string): void;
    show(): void;
    hide(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  themeParams: Record<string, string>;
  initDataUnsafe?: { user?: { first_name?: string; last_name?: string } };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}
