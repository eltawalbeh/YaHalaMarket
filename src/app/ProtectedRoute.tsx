import { Navigate, Outlet, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  loading: boolean;
  authenticated: boolean;
};

export function ProtectedRoute({ loading, authenticated }: ProtectedRouteProps) {
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جارٍ التحميل…</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
