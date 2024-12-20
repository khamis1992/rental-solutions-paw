import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import Auth from "@/pages/Auth";
import { useSessionContext } from "@supabase/auth-helpers-react";

// Lazy load all pages
const Index = lazy(() => import("@/pages/Index"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const Customers = lazy(() => import("@/pages/Customers"));
const Finance = lazy(() => import("@/pages/Finance"));
const Help = lazy(() => import("@/pages/Help"));
const Legal = lazy(() => import("@/pages/Legal"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));

// Define protected routes configuration
const protectedRoutes = [
  { path: "/", component: Index },
  { path: "/agreements", component: Agreements },
  { path: "/customers", component: Customers },
  { path: "/customer/:id", component: CustomerProfile },
  { path: "/finance", component: Finance },
  { path: "/help", component: Help },
  { path: "/legal", component: Legal },
  { path: "/maintenance", component: Maintenance },
  { path: "/reports", component: Reports },
  { path: "/settings", component: Settings },
  { path: "/traffic-fines", component: TrafficFines },
  { path: "/vehicles", component: Vehicles },
];

export default function App() {
  const { session, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={
        session ? <Navigate to="/" replace /> : <Auth />
      } />

      {/* Protected routes */}
      <Route element={
        session ? (
          <DashboardLayout>
            <RouteWrapper>
              <Routes>
                {protectedRoutes.map(({ path, component: Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<Component />}
                  />
                ))}
              </Routes>
            </RouteWrapper>
          </DashboardLayout>
        ) : (
          <Navigate to="/auth" replace />
        )
      }>
        {protectedRoutes.map(({ path }) => (
          <Route key={path} path={path} element={null} />
        ))}
      </Route>
    </Routes>
  );
}