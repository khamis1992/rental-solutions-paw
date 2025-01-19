import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Suspense } from "react";
import * as Pages from "@/routes/routes";
import { AuthContainer } from "./components/auth/AuthContainer";
import { CustomerPortalAuth } from "./components/auth/CustomerPortalAuth";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthContainer />} />
            <Route path="/customer-portal/auth" element={<CustomerPortalAuth />} />
            <Route path="/customer-portal" element={<Pages.CustomerPortal />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <RouteWrapper>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Pages.Dashboard />} />
                    <Route path="vehicles" element={<Pages.Vehicles />} />
                    <Route path="vehicles/:id" element={<Pages.VehicleDetails />} />
                    <Route path="customers" element={<Pages.Customers />} />
                    <Route path="customers/:id" element={<Pages.CustomerProfile />} />
                    <Route path="agreements" element={<Pages.Agreements />} />
                    <Route path="remaining-amount" element={<Pages.RemainingAmount />} />
                    <Route path="settings" element={<Pages.Settings />} />
                    <Route path="maintenance" element={<Pages.Maintenance />} />
                    <Route path="traffic-fines" element={<Pages.TrafficFines />} />
                    <Route path="reports" element={<Pages.Reports />} />
                    <Route path="finance" element={<Pages.Finance />} />
                    <Route path="help" element={<Pages.Help />} />
                    <Route path="legal" element={<Pages.Legal />} />
                    <Route path="audit" element={<Pages.Audit />} />
                  </Routes>
                </DashboardLayout>
              </RouteWrapper>
            } />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;