export type NotificationChannel = "dashboard" | "email" | "telegram"

export interface NotificationEvent {
  id: string
  type: string
  recipient_user_ids: string[]
  channels: NotificationChannel[]
  resource: string
  resource_id: string
  payload: Record<string, unknown>
  created_at: string
}
