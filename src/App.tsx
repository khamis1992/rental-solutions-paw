import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "@/pages/Index";
import Agreements from "@/pages/Agreements";
import CustomerProfile from "@/pages/CustomerProfile";
import Customers from "@/pages/Customers";
import Finance from "@/pages/Finance";
import Help from "@/pages/Help";
import Legal from "@/pages/Legal";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import TrafficFines from "@/pages/TrafficFines";
import Vehicles from "@/pages/Vehicles";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={
          <DashboardLayout>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </DashboardLayout>
        }>
          <Route path="/" element={
            <ErrorBoundary>
              <Index />
            </ErrorBoundary>
          } />
          <Route path="/agreements" element={
            <ErrorBoundary>
              <Agreements />
            </ErrorBoundary>
          } />
          <Route path="/customers" element={
            <ErrorBoundary>
              <Customers />
            </ErrorBoundary>
          } />
          <Route path="/customer/:id" element={
            <ErrorBoundary>
              <CustomerProfile />
            </ErrorBoundary>
          } />
          <Route path="/finance" element={
            <ErrorBoundary>
              <Finance />
            </ErrorBoundary>
          } />
          <Route path="/help" element={
            <ErrorBoundary>
              <Help />
            </ErrorBoundary>
          } />
          <Route path="/legal" element={
            <ErrorBoundary>
              <Legal />
            </ErrorBoundary>
          } />
          <Route path="/maintenance" element={
            <ErrorBoundary>
              <Maintenance />
            </ErrorBoundary>
          } />
          <Route path="/reports" element={
            <ErrorBoundary>
              <Reports />
            </ErrorBoundary>
          } />
          <Route path="/settings" element={
            <ErrorBoundary>
              <Settings />
            </ErrorBoundary>
          } />
          <Route path="/traffic-fines" element={
            <ErrorBoundary>
              <TrafficFines />
            </ErrorBoundary>
          } />
          <Route path="/vehicles" element={
            <ErrorBoundary>
              <Vehicles />
            </ErrorBoundary>
          } />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}