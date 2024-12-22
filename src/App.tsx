import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import Auth from "@/pages/Auth";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Define route component type
type RouteComponent = React.LazyExoticComponent<React.ComponentType>;

// Lazy load all pages with loading fallback
const lazyLoad = (Component: RouteComponent) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }>
    <Component />
  </Suspense>
);

// Import existing pages
const Dashboard = lazy(() => import("@/pages/Index"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const Customers = lazy(() => import("@/pages/Customers"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Settings = lazy(() => import("@/pages/Settings"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Reports = lazy(() => import("@/pages/Reports"));
const Finance = lazy(() => import("@/pages/Finance"));

// Define protected route type
interface ProtectedRoute {
  path: string;
  component: RouteComponent;
}

const protectedRoutes: ProtectedRoute[] = [
  { path: "/", component: Dashboard },
  { path: "/vehicles", component: Vehicles },
  { path: "/agreements", component: Agreements },
  { path: "/customers", component: Customers },
  { path: "/maintenance", component: Maintenance },
  { path: "/settings", component: Settings },
  { path: "/traffic-fines", component: TrafficFines },
  { path: "/reports", component: Reports },
  { path: "/finance", component: Finance },
];

export default function App() {
  const { session, isLoading } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Session state:", { session, isLoading });
  }, [session, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Auth />
          )
        } 
      />

      {/* Protected routes wrapper */}
      <Route
        element={
          session ? (
            <DashboardLayout>
              <RouteWrapper />
            </DashboardLayout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      >
        {/* Define child routes */}
        {protectedRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={lazyLoad(Component)}
          />
        ))}
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}