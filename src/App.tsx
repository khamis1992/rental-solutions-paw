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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route
              path="/"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/vehicles"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Vehicles />
                </Suspense>
              }
            />
            <Route
              path="/vehicles/:id"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.VehicleDetails />
                </Suspense>
              }
            />
            <Route
              path="/customers"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Customers />
                </Suspense>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.CustomerProfile />
                </Suspense>
              }
            />
            <Route
              path="/agreements"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Agreements />
                </Suspense>
              }
            />
            <Route
              path="/remaining-amount"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.RemainingAmount />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Settings />
                </Suspense>
              }
            />
            <Route
              path="/maintenance/*"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Maintenance />
                </Suspense>
              }
            />
            <Route
              path="/traffic-fines"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.TrafficFines />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Reports />
                </Suspense>
              }
            />
            <Route
              path="/finance"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Finance />
                </Suspense>
              }
            />
            <Route
              path="/help"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Help />
                </Suspense>
              }
            />
            <Route
              path="/legal"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Legal />
                </Suspense>
              }
            />
            <Route
              path="/audit"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Audit />
                </Suspense>
              }
            />
          </Route>

          {/* Catch all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}