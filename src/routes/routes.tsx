import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { CustomerPortalAuth } from "@/components/auth/CustomerPortalAuth";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const VehicleDetails = lazy(() => import("@/pages/VehicleDetails"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const RemainingAmount = lazy(() => import("@/pages/RemainingAmount"));
const Settings = lazy(() => import("@/pages/Settings"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Reports = lazy(() => import("@/pages/Reports"));
const Finance = lazy(() => import("@/pages/Finance"));
const Help = lazy(() => import("@/pages/Help"));
const Legal = lazy(() => import("@/pages/Legal"));
const Audit = lazy(() => import("@/pages/Audit"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));

export const routes = (
  <>
    {/* Public Routes */}
    <Route path="/auth" element={<AuthContainer />} />
    <Route path="/customer-portal/auth" element={<CustomerPortalAuth />} />
    <Route path="/customer-portal" element={<CustomerPortal />} />

    {/* Protected Routes */}
    <Route path="/" element={<DashboardLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="vehicles" element={<Vehicles />} />
      <Route path="vehicles/:id" element={<VehicleDetails />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerProfile />} />
      <Route path="agreements" element={<Agreements />} />
      <Route path="remaining-amount" element={<RemainingAmount />} />
      <Route path="settings" element={<Settings />} />
      <Route path="maintenance" element={<Maintenance />} />
      <Route path="traffic-fines" element={<TrafficFines />} />
      <Route path="reports" element={<Reports />} />
      <Route path="finance" element={<Finance />} />
      <Route path="help" element={<Help />} />
      <Route path="legal" element={<Legal />} />
      <Route path="audit" element={<Audit />} />
    </Route>
  </>
);