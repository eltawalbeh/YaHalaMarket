export const PUBLIC_ROUTES = {
  market:      '/',
  offers:      '/offers',
  offerDetail: (slug: string) => `/offers/${slug}`,
  quote:       (token: string) => `/q/${token}`,
  legal:       '/legal',
} as const;

export const DASHBOARD_ROUTES = {
  home:       '/dashboard',
  offers:     '/dashboard/offers',
  offerNew:   '/dashboard/offers/new',
  offerEdit:  (id: string) => `/dashboard/offers/${id}/edit`,
  hotels:     '/dashboard/hotels',
  leads:      '/dashboard/leads',
  quotes:     '/dashboard/quotes',
  reports:    '/dashboard/reports',
  team:       '/dashboard/team',
  auditLog:   '/dashboard/audit-log',
  settings:   '/dashboard/settings',
  login:      '/login',
} as const;

export const ROUTE_PATTERNS = {
  offerDetail: '/offers/:slug',
  quote:       '/q/:token',
  offerEdit:   '/dashboard/offers/:id/edit',
} as const;
