import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import * as LazyComponents from "@/routes/routes";

export default function App() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          variant: "default",
        });
        // Only navigate to dashboard if we're on the auth page and not importing
        if (location.pathname === '/auth' && !sessionStorage.getItem('importInProgress')) {
          navigate('/');
        }
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "You have been logged out.",
          variant: "default",
        });
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate, location.pathname]);

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
            path="/finance"
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
