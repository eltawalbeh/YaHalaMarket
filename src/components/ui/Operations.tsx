import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { useLang } from "@/app/providers/LangContext";

export function Icon({
  file,
  className = "",
}: {
  file: string;
  className?: string;
}) {
  return (
    <img
      src={"/assets/figma/" + file + ".svg"}
      alt=""
      className={"shrink-0 " + className}
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
