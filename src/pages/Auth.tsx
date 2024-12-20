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

  useEffect(() => {
    // Track page load performance
    const pageLoadStart = performance.now();

    // Enhanced session management
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          console.log("User already authenticated, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
        performanceMetrics.trackPageLoad(
          'auth',
          performance.now() - pageLoadStart
        );
      }
    };

    initializeAuth();

    // Set up auth state change listener
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
            navigate("/");
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
          toast.error("Failed to load user profile");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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