import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import * as LazyComponents from "@/routes/routes";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Skeleton className="h-[200px] w-[200px]" />
  </div>
);

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
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <PWAInstallPrompt />
      <Routes>
        {/* Public Routes - No Layout */}
        <Route
          path="/auth"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <LazyComponents.Auth />
            </Suspense>
          }
        />

        <Route
          path="/customer-portal"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <LazyComponents.CustomerPortal />
            </Suspense>
          }
        />

        {/* Protected Routes - With Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Dashboard />
              </Suspense>
            }
          />

          <Route
            path="/vehicles"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Vehicles />
              </Suspense>
            }
          />

          <Route
            path="/vehicles/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.VehicleDetails />
              </Suspense>
            }
          />

          <Route
            path="/customers"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Customers />
              </Suspense>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.CustomerProfile />
              </Suspense>
            }
          />

          <Route
            path="/agreements"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Agreements />
              </Suspense>
            }
          />

          <Route
            path="/remaining-amount"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.RemainingAmount />
              </Suspense>
            }
          />

          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Settings />
              </Suspense>
            }
          />

          <Route
            path="/maintenance/*"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Maintenance />
              </Suspense>
            }
          />

          <Route
            path="/chauffeur-service"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.ChauffeurService />
              </Suspense>
            }
          />

          <Route
            path="/traffic-fines"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.TrafficFines />
              </Suspense>
            }
          />

          <Route
            path="/reports"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Reports />
              </Suspense>
            }
          />

          <Route
            path="/finance/*"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Finance />
              </Suspense>
            }
          />

          <Route
            path="/finance/car-installments/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.CarInstallmentDetails />
              </Suspense>
            }
          />

          <Route
            path="/help"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Help />
              </Suspense>
            }
          />

          <Route
            path="/legal"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Legal />
              </Suspense>
            }
          />

          <Route
            path="/audit"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyComponents.Audit />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
