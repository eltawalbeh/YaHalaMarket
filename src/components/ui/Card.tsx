import { cx } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cx(
        'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]',
        padding && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('mb-4 pb-4 border-b border-[var(--border)]', className)}>
      {children}
    </div>
  );
}
