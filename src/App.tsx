import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import * as LazyComponents from "@/routes/routes";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-solutions-theme">
      <div className="min-h-screen bg-background">
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                <LazyComponents.Auth />
              </Suspense>
            }
          />

          {/* Protected Routes - All wrapped in DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                    <Routes>
                      <Route path="/" element={<LazyComponents.Dashboard />} />
                      <Route path="/vehicles" element={<LazyComponents.Vehicles />} />
                      <Route path="/vehicles/:id" element={<LazyComponents.VehicleDetails />} />
                      <Route path="/customers" element={<LazyComponents.Customers />} />
                      <Route path="/customers/:id" element={<LazyComponents.CustomerProfile />} />
                      <Route path="/agreements" element={<LazyComponents.Agreements />} />
                      <Route path="/remaining-amount" element={<LazyComponents.RemainingAmount />} />
                      <Route path="/settings" element={<LazyComponents.Settings />} />
                      <Route path="/maintenance/*" element={<LazyComponents.Maintenance />} />
                      <Route path="/traffic-fines" element={<LazyComponents.TrafficFines />} />
                      <Route path="/reports" element={<LazyComponents.Reports />} />
                      <Route path="/finance" element={<LazyComponents.Finance />} />
                      <Route path="/help" element={<LazyComponents.Help />} />
                      <Route path="/legal" element={<LazyComponents.Legal />} />
                      <Route path="/audit" element={<LazyComponents.Audit />} />
                    </Routes>
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}