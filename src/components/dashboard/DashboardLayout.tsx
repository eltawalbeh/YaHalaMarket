import type { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardSidebar />
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ paddingInlineStart: 'var(--sidebar-width)' }}
      >
        <main className="flex-1 p-6 max-w-screen-xl">{children}</main>
      </div>
    </div>
  );
}
