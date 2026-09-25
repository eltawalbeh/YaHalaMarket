import { cx } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'teal' | 'gold';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  green:   'bg-emerald-100 text-emerald-800',
  yellow:  'bg-amber-100 text-amber-800',
  red:     'bg-red-100 text-red-800',
  blue:    'bg-blue-100 text-blue-800',
  gray:    'bg-stone-100 text-stone-600',
  teal:    'bg-teal-100 text-teal-800',
  gold:    'bg-amber-50 text-amber-700 border border-amber-200',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
