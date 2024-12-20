import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { performanceMetrics } from "@/services/performanceMonitoring";

export default function Auth() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    // Track page load performance
    const pageLoadStart = performance.now();

    // Enhanced session management with error handling
    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setSession(session);
        
        if (session) {
          console.log("User already authenticated, redirecting to home");
          navigate("/");
        }

        // Track successful initialization
        performanceMetrics.trackPageLoad(
          'auth/initialization',
          performance.now() - pageLoadStart
        );
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Failed to initialize authentication", {
          description: "Please try refreshing the page"
        });
        
        // Track error in performance metrics
        performanceMetrics.trackError({
          message: "Auth initialization failed",
          stack: error?.message || "Unknown error",
          context: { page: 'auth' }
        });
      } finally {
        setIsLoading(false);
        setLoadTime(performance.now() - pageLoadStart);
      }
    };

    initializeAuth();

    // Set up auth state change listener with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);

      if (session) {
        try {
          // Get user profile data
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            console.log("User profile:", { role: data.role });
            
            // Track successful authentication
            performanceMetrics.trackPageLoad(
              'auth/success',
              performance.now() - pageLoadStart
            );
            
            navigate("/");
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
          toast.error("Failed to load user profile", {
            description: "Please try logging in again"
          });
          
          // Track profile fetch error
          performanceMetrics.trackError({
            message: "Profile fetch failed",
            stack: error?.message || "Unknown error",
            context: { page: 'auth' }
          });
        }
      }
    });

    // Clean up subscription and track performance metrics
    return () => {
      subscription.unsubscribe();
      performanceMetrics.trackPageLoad(
        'auth/cleanup',
        performance.now() - pageLoadStart
      );
    };
  }, [navigate]);

  // Loading state with performance tracking
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-[500px] rounded-lg bg-white p-8 shadow-xl mx-4">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        {loadTime > 0 && (
          <div className="text-xs text-gray-500 text-center mb-4">
            Page loaded in {Math.round(loadTime)}ms
          </div>
        )}
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                padding: '12px',
                fontSize: '16px',
                width: '100%',
                marginTop: '8px',
              },
              input: {
                padding: '12px',
                fontSize: '16px',
                width: '100%',
              },
              label: {
                fontSize: '16px',
                marginBottom: '8px',
              },
              container: {
                width: '100%',
              },
            },
          }}
          providers={[]}
        />
      </div>
    </div>
  );
}