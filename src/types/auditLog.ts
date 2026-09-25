export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'assign'
  | 'publish'
  | 'archive'
  | 'login'
  | 'logout';

export type AuditResource =
  | 'offer'
  | 'hotel'
  | 'lead'
  | 'quote'
  | 'user'
  | 'setting';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: AuditAction;
  resource: AuditResource;
  resource_id: string;
  resource_label: string;
  diff: Record<string, { before: unknown; after: unknown }> | null;
  ip_address: string | null;
  created_at: string;
}
