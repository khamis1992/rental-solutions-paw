import { lazy } from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";

// Lazy loaded components
export const Auth = lazy(() => import("@/pages/Auth"));
export const Dashboard = lazy(() => import("@/pages/Dashboard"));
export const Vehicles = lazy(() => import("@/pages/Vehicles"));
export const VehicleDetails = lazy(() => import("@/pages/VehicleDetails"));
export const Customers = lazy(() => import("@/pages/Customers"));
export const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
export const Agreements = lazy(() => import("@/pages/Agreements"));
export const RemainingAmount = lazy(() => import("@/pages/RemainingAmount"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const Maintenance = lazy(() => import("@/pages/Maintenance"));
export const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
export const Reports = lazy(() => import("@/pages/Reports"));
export const Finance = lazy(() => import("@/pages/Finance"));
export const Help = lazy(() => import("@/pages/Help"));
export const Legal = lazy(() => import("@/pages/Legal"));
export const Audit = lazy(() => import("@/pages/Audit"));
export const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerProfile />} />
      <Route path="/agreements" element={<Agreements />} />
      <Route path="/remaining-amount" element={<RemainingAmount />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/traffic-fines" element={<TrafficFines />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/help" element={<Help />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/audit" element={<Audit />} />
      <Route path="/customer-portal" element={<CustomerPortal />} />
      <Route path="/" element={<Dashboard />} />
    </RouterRoutes>
  );
};