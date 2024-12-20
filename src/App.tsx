import { Routes, Route, Outlet } from "react-router-dom";
import { lazy } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RouteWrapper } from "@/components/layout/RouteWrapper";

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

// Define routes configuration
const routes = [
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
  return (
    <Routes>
      <Route
        element={
          <DashboardLayout>
            <RouteWrapper>
              <Outlet />
            </RouteWrapper>
          </DashboardLayout>
        }
      >
        {routes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <RouteWrapper>
                <Component />
              </RouteWrapper>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}