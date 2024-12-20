import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { performanceMetrics } from "@/services/performanceMonitoring";

const Auth = () => {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    console.log("Initializing Auth component...");

    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          toast.error("Failed to check authentication status");
          return;
        }

        if (existingSession) {
          console.log("Existing session found");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            console.log("Creating new profile for user");
            const { error: createError } = await supabase
              .from('profiles')
              .insert([{ 
                id: existingSession.user.id,
                full_name: existingSession.user.user_metadata.full_name,
                role: 'customer'
              }]);

            if (createError) {
              console.error("Failed to create profile:", createError);
              toast.error("Failed to create user profile");
            }
          }

          navigate('/');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast.error("Authentication system initialization failed");
      } finally {
        setIsInitializing(false);
        const endTime = performance.now();
        const timeElapsed = endTime - startTime;
        setLoadTime(timeElapsed);
        performanceMetrics.trackPageLoad('auth', timeElapsed);
      }
    };

    initializeAuth();
  }, [navigate]);

  if (isInitializing || sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Rental Solutions</h1>
          <p className="text-gray-600">Please sign in to continue</p>
          {loadTime && (
            <p className="text-xs text-gray-400 mt-2">
              Page loaded in {Math.round(loadTime)}ms
            </p>
          )}
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded',
              input: 'w-full px-3 py-2 border rounded',
              label: 'text-gray-700',
              message: 'text-red-600'
            }
          }}
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Auth;