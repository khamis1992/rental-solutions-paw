import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import * as LazyComponents from "@/routes/routes";

export default function App() {
  const { session, isLoading, error } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (error?.message?.includes('refresh_token_not_found')) {
      toast.error('Your session has expired. Please sign in again.');
      navigate('/auth');
    }
  }, [error, navigate]);

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

          <Route
            path="/customer-portal"
            element={
              <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                <LazyComponents.CustomerPortal />
              </Suspense>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LazyComponents.Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <LazyComponents.Vehicles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <LazyComponents.VehicleDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <LazyComponents.Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <LazyComponents.CustomerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agreements"
            element={
              <ProtectedRoute>
                <LazyComponents.Agreements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/remaining-amount"
            element={
              <ProtectedRoute>
                <LazyComponents.RemainingAmount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <LazyComponents.Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance/*"
            element={
              <ProtectedRoute>
                <LazyComponents.Maintenance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/traffic-fines"
            element={
              <ProtectedRoute>
                <LazyComponents.TrafficFines />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <LazyComponents.Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance/*"
            element={
              <ProtectedRoute>
                <LazyComponents.Finance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <LazyComponents.Help />
              </ProtectedRoute>
            }
          />

          <Route
            path="/legal"
            element={
              <ProtectedRoute>
                <LazyComponents.Legal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <LazyComponents.Audit />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}