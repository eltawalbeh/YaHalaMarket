import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { useLang } from "@/app/providers/LangContext";
import {
  ArrowUpRightIcon,
  BuildingsIcon,
  BrowserIcon,
  CalendarCheckIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  ChatCenteredTextIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  CurrencyDollarIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileTextIcon,
  HandshakeIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MapPinAreaIcon,
  PaperPlaneTiltIcon,
  QuestionIcon,
  SignOutIcon,
  StarIcon,
  SuitcaseRollingIcon,
  TimerIcon,
  TrendUpIcon,
  UserGearIcon,
  UserPlusIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
const iconGlyphs: Record<string, typeof HouseIcon> = {
  "59933": ArrowUpRightIcon,
  "61322": HandshakeIcon,
  "68562": BuildingsIcon,
  "0154b": SuitcaseRollingIcon,
  "097fa": TimerIcon,
  "09a33": CheckCircleIcon,
  "19ec3": StarIcon,
  "296b5": ClockIcon,
  "4346a": TrendUpIcon,
  "4d609": ArrowUpRightIcon,
  "4edf7": ClockCountdownIcon,
  "585f9": DownloadSimpleIcon,
  "6ba6a": BuildingsIcon,
  "6cc69": CurrencyDollarIcon,
  "779e1": FileTextIcon,
  "7e1a2": ChatCenteredTextIcon,
  "879c7": MagnifyingGlassIcon,
  "909e5": CalendarCheckIcon,
  "9782b": ArrowUpRightIcon,
  "9d9f7": UserGearIcon,
  "9f93d": EyeIcon,
  "a3951": PaperPlaneTiltIcon,
  "a49e4": MagnifyingGlassIcon,
  "a8288": CurrencyCircleDollarIcon,
  "abb6f": EyeIcon,
  "c4c4f": SuitcaseRollingIcon,
  "dd900": UserPlusIcon,
  "e1914": ClockCountdownIcon,
  "e6954": SignOutIcon,
  "ea6d9": UsersIcon,
  "29e28": HouseIcon,
  "407b7": SuitcaseRollingIcon,
  "841b7": BuildingsIcon,
  "f62a4": UsersThreeIcon,
  "ff452": ChartLineUpIcon,
  "061e3": BrowserIcon,
  "d7189": MapPinAreaIcon,
  "36af2": CalendarDotsIcon,
  "decad": ChatCenteredTextIcon,
};

export function Icon({
  file,
  className = "",
}: {
  file: string;
  className?: string;
}) {
  const Glyph = iconGlyphs[file] ?? QuestionIcon;
  return (
    <Glyph
      aria-hidden="true"
      className={"shrink-0 " + className}
      size={18}
      weight="regular"
    />
  );
}
export function PageTitle({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
export function Metrics({
  items,
}: {
  items: { label: string; value: ReactNode; hint?: string; icon?: string }[];
}) {
  return (
    <div className="metrics">
      {items.map((item) => (
        <div className="metric" key={item.label}>
          <div className="flex items-center justify-between gap-3">
            <p>{item.label}</p>
            {item.icon && (
              <span className="metric-icon">
                <Icon file={item.icon} />
              </span>
            )}
          </div>
          <strong dir="auto">{item.value}</strong>
          {item.hint && <small>{item.hint}</small>}
        </div>
      ))}
    </div>
  );
}
export function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return error ? (
    <p role="alert" className="feedback error">
      {error}
    </p>
  ) : message ? (
    <p role="status" className="feedback success">
      {message}
    </p>
  ) : null;
}
export function LoadingState({
  loading,
  error,
  retry,
  empty,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
  empty?: boolean;
}) {
  const { lang } = useLang();
  const ar = lang === "ar";
  if (error)
    return (
      <div className="empty-state">
        <Feedback error={error} />
        <Button onClick={retry}>{ar ? "إعادة المحاولة" : "Try again"}</Button>
      </div>
    );
  if (loading)
    return (
      <div className="empty-state" role="status">
        {ar ? "جارٍ التحميل…" : "Loading…"}
      </div>
    );
  if (empty)
    return (
      <div className="empty-state">
        {ar ? "لا توجد نتائج مطابقة." : "No matching results."}
      </div>
    );
  return null;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label={title}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button type="button" aria-label="إغلاق / Close" onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function DataTable<T>({
  rows,
  columns,
  rowKey,
}: {
  rows: T[];
  columns: { label: string; render: (row: T) => ReactNode }[];
  rowKey: (row: T) => string;
}) {
  const [page, setPage] = useState(0);
  const { lang } = useLang();
  const count = Math.ceil(rows.length / 12);
  const safePage = Math.min(page, Math.max(0, count - 1));
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(safePage * 12, (safePage + 1) * 12).map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((c) => (
                  <td key={c.label}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          {rows.length} {lang === "ar" ? "نتيجة" : "results"}
        </span>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            ‹
          </button>
          <span>
            {safePage + 1} / {count || 1}
          </span>
          <button
            aria-label="Next page"
            disabled={safePage + 1 >= count}
            onClick={() => setPage(safePage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
