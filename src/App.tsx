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

// Define protected route interface
interface ProtectedRouteConfig {
  path: string;
  component: React.ComponentType;
}

const protectedRoutes: ProtectedRouteConfig[] = [
  { path: "/", component: Dashboard },
  { path: "/vehicles", component: Vehicles },
  { path: "/vehicles/:id", component: VehicleDetails },
  { path: "/customers", component: Customers },
  { path: "/customers/:id", component: CustomerProfile },
  { path: "/agreements", component: Agreements },
  { path: "/settings", component: Settings },
  { path: "/maintenance/*", component: Maintenance },
  { path: "/traffic-fines", component: TrafficFines },
  { path: "/reports", component: Reports },
  { path: "/finance", component: Finance },
  { path: "/help", component: Help },
  { path: "/legal", component: Legal },
  { path: "/audit", component: Audit },
];

export default function App() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: session, isLoading: loadingSession, error } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        // First try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        // If no session, try to refresh
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
        // Clear any stale auth data
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
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  // Redirect to auth if no session and not loading
  useEffect(() => {
    if (!loadingSession && !session && window.location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [session, loadingSession, navigate]);

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

          {protectedRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                session ? (
                  <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                    <RouteWrapper>
                      <div className="content-container">
                        <Component />
                      </div>
                    </RouteWrapper>
                  </Suspense>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}