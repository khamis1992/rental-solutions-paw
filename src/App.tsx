
import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import * as LazyComponents from "@/routes/routes";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function App() {
  const { session, isLoading, error } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        supabase.auth.refreshSession();
      }
    });

    if (error) {
      console.error('Session error:', error);
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('session_not_found')) {
        toast.error('Your session has expired. Please sign in again.');
        supabase.auth.signOut().then(() => {
          navigate('/auth');
        });
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [error, navigate]);

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-solutions-theme">
      <div className="min-h-screen bg-background">
        <Toaster />
        <Routes>
          {/* Public Routes - No Layout */}
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

          {/* Protected Routes - With Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
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
              path="/chauffeur-service"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.ChauffeurService />
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
              path="/finance/*"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.Finance />
                </Suspense>
              }
            />

            <Route
              path="/finance/car-installments/:id"
              element={
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <LazyComponents.CarInstallmentDetails />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
