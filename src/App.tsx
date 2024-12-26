import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import { ThemeProvider } from "@/components/theme/theme-provider";

// Lazy load components
const Auth = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/Index"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const VehicleDetails = lazy(() => import("@/components/vehicles/VehicleDetails"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const Agreements = lazy(() => import("@/pages/Agreements"));
const Settings = lazy(() => import("@/pages/Settings"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Reports = lazy(() => import("@/pages/Reports"));
const Finance = lazy(() => import("@/pages/Finance"));
const Help = lazy(() => import("@/pages/Help"));
const Legal = lazy(() => import("@/pages/Legal"));
const Audit = lazy(() => import("@/pages/Audit"));

export default function App() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: session, isLoading: loadingSession, error } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Refresh error:", refreshError);
            throw refreshError;
          }
          
          return refreshedSession;
        }

        return session;
      } catch (error) {
        console.error("Auth error:", error);
        await supabase.auth.signOut();
        navigate('/auth');
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          variant: "default",
        });
        navigate('/');
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
  }, [toast, navigate]);

  if (loadingSession) {
    return <Skeleton className="h-screen w-screen" />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-solutions-theme">
      <div className="min-h-screen bg-background">
        <Toaster />
        <Routes>
          <Route
            path="/auth"
            element={
              <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                <Auth />
              </Suspense>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Dashboard />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/vehicles"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Vehicles />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/vehicles/:id"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <VehicleDetails />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Other protected routes */}
          <Route
            path="/customers"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Customers />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/customers/:id"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <CustomerProfile />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/agreements"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Agreements />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/settings"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Settings />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/maintenance/*"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Maintenance />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/traffic-fines"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <TrafficFines />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/reports"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Reports />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/finance"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Finance />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/help"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Help />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/legal"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Legal />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/audit"
            element={
              session ? (
                <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                  <RouteWrapper>
                    <Audit />
                  </RouteWrapper>
                </Suspense>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
