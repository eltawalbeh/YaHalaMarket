# Security correction: protect dashboard routes

The current main-repo Router exposes dashboard elements directly from route definitions. Before production, import `ProtectedRoute` and wrap all dashboard routes in one parent route:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path={DASHBOARD_ROUTES.home} element={<DashboardHome />} />
  <Route path={DASHBOARD_ROUTES.offers} element={<DashboardOffers />} />
  <Route path={DASHBOARD_ROUTES.offerNew} element={<OfferWizard />} />
  <Route path={DASHBOARD_ROUTES.hotels} element={<Hotels />} />
  <Route path={DASHBOARD_ROUTES.leads} element={<Leads />} />
  <Route path={DASHBOARD_ROUTES.quotes} element={<Quotes />} />
  <Route path={DASHBOARD_ROUTES.reports} element={<Reports />} />
  <Route path={DASHBOARD_ROUTES.team} element={<Team />} />
  <Route path={DASHBOARD_ROUTES.auditLog} element={<AuditLog />} />
  <Route path={DASHBOARD_ROUTES.settings} element={<Settings />} />
</Route>
```

This is a client-side UX guard only. Supabase RLS and server-side authorization remain mandatory.
