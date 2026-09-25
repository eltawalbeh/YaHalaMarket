# Security correction: protect dashboard routes

The current main-repo Router exposes dashboard elements directly from route definitions. The repository currently has no `AuthContext` or `useAuth` implementation, so the guard is intentionally adapter-based.

1. Add the project's real Supabase/Auth session provider.
2. Pass its `loading` and authenticated-user state to `ProtectedRoute`.
3. Wrap all dashboard routes in one parent route:

```tsx
<Route element={<ProtectedRoute loading={authLoading} authenticated={Boolean(user)} />}>
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
