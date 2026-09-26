export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>

export function trackEvent(name: string, properties: AnalyticsProperties = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('yahala:analytics', { detail: { name, properties } }))
  if (import.meta.env.DEV) console.debug(`[analytics] ${name}`, properties)
}
