import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import Auth from "@/pages/Auth";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load all pages with loading fallback
const lazyLoad = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
);

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const VehicleDetails = lazy(() => import("@/pages/VehicleDetails"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const AgreementDetails = lazy(() => import("@/pages/AgreementDetails"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerDetails = lazy(() => import("@/pages/CustomerDetails"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const MaintenanceDetails = lazy(() => import("@/pages/MaintenanceDetails"));
const VehicleInspection = lazy(() => import("@/pages/VehicleInspection"));
const Payments = lazy(() => import("@/pages/Payments"));
const PaymentDetails = lazy(() => import("@/pages/PaymentDetails"));
const Settings = lazy(() => import("@/pages/Settings"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const TrafficFineDetails = lazy(() => import("@/pages/TrafficFineDetails"));
const Reports = lazy(() => import("@/pages/Reports"));

const protectedRoutes = [
  { path: "/", component: Dashboard },
  { path: "/vehicles", component: Vehicles },
  { path: "/vehicles/:id", component: VehicleDetails },
  { path: "/agreements", component: Agreements },
  { path: "/agreements/:id", component: AgreementDetails },
  { path: "/customers", component: Customers },
  { path: "/customers/:id", component: CustomerDetails },
  { path: "/maintenance", component: Maintenance },
  { path: "/maintenance/:id", component: MaintenanceDetails },
  { path: "/maintenance/:id/inspection", component: VehicleInspection },
  { path: "/payments", component: Payments },
  { path: "/payments/:id", component: PaymentDetails },
  { path: "/settings", component: Settings },
  { path: "/traffic-fines", component: TrafficFines },
  { path: "/traffic-fines/:id", component: TrafficFineDetails },
  { path: "/reports", component: Reports },
];

export default function App() {
  const { session, isLoading } = useSessionContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TooltipProvider>
      <Routes>
        {/* Public route */}
        <Route 
          path="/auth" 
          element={session ? <Navigate to="/" replace /> : <Auth />} 
        />

        {/* Protected routes wrapper */}
        <Route
          path="/"
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
      </Routes>
    </TooltipProvider>
  );
}