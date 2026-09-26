import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ROUTE_PATTERNS, DASHBOARD_ROUTES } from "@/lib/routes"
import { ProtectedRoute } from "@/app/ProtectedRoute"

const Market = lazy(() => import("@/pages/public/Market"))
const Offers = lazy(() => import("@/pages/public/Offers"))
const Plan = lazy(() => import("@/pages/public/Plan"))
const OfferDetail = lazy(() => import("@/pages/public/OfferDetail"))
const Quote = lazy(() => import("@/pages/public/Quote"))
const Legal = lazy(() => import("@/pages/public/Legal"))

const Login = lazy(() => import("@/pages/dashboard/Login"))
const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome"))
const DashboardOffers = lazy(() => import("@/pages/dashboard/Offers"))
const OfferWizard = lazy(() => import("@/pages/dashboard/OfferWizard"))
const Hotels = lazy(() => import("@/pages/dashboard/Hotels"))
const Leads = lazy(() => import("@/pages/dashboard/Leads"))
const Quotes = lazy(() => import("@/pages/dashboard/Quotes"))
const Reports = lazy(() => import("@/pages/dashboard/Reports"))
const Team = lazy(() => import("@/pages/dashboard/Team"))
const AuditLog = lazy(() => import("@/pages/dashboard/AuditLog"))
const Settings = lazy(() => import("@/pages/dashboard/Settings"))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <span className="text-sm text-[var(--muted-foreground)]">
        جارٍ التحميل…
      </span>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Market />} />
          <Route path="/offers" element={<Offers />} />
          <Route path={ROUTE_PATTERNS.offerDetail} element={<OfferDetail />} />
          <Route path={ROUTE_PATTERNS.quote} element={<Quote />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/legal" element={<Legal />} />
          <Route path={DASHBOARD_ROUTES.login} element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path={DASHBOARD_ROUTES.home} element={<DashboardHome />} />
            <Route
              path={DASHBOARD_ROUTES.offers}
              element={<DashboardOffers />}
            />
            <Route path={DASHBOARD_ROUTES.offerNew} element={<OfferWizard />} />
            <Route path={DASHBOARD_ROUTES.hotels} element={<Hotels />} />
            <Route path={DASHBOARD_ROUTES.leads} element={<Leads />} />
            <Route path={DASHBOARD_ROUTES.quotes} element={<Quotes />} />
            <Route path={DASHBOARD_ROUTES.reports} element={<Reports />} />
            <Route path={DASHBOARD_ROUTES.team} element={<Team />} />
            <Route path={DASHBOARD_ROUTES.auditLog} element={<AuditLog />} />
            <Route path={DASHBOARD_ROUTES.settings} element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
