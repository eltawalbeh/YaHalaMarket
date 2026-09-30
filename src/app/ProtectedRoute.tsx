import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { canAccessDashboardPath } from "@/lib/permissions";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();

  if (loading)
    return (
      <p role="status" className="p-8 text-center">
        جارٍ التحقق من الجلسة…
      </p>
    );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user?.is_active) return <Navigate to="/login" replace />;
  if (!canAccessDashboardPath(user.role, location.pathname)) {
    return (
      <Navigate
        to={user.role === "accounting" ? "/dashboard/reports" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}
