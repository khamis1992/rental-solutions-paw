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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Rental Solutions</h1>
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
            extend: true,
            className: {
              container: 'flex flex-col gap-4',
              button: 'bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors',
              input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
              label: 'block text-sm font-medium text-gray-700 mb-1',
              message: 'text-sm text-red-600 mt-1',
              anchor: 'text-primary hover:text-primary/80 transition-colors'
            },
            variables: {
              default: {
                colors: {
                  brand: 'rgb(37 99 235)',
                  brandAccent: 'rgb(29 78 216)',
                  inputBackground: 'white',
                  inputText: 'rgb(17 24 39)',
                  inputBorder: 'rgb(209 213 219)',
                  inputBorderHover: 'rgb(37 99 235)',
                  inputBorderFocus: 'rgb(37 99 235)',
                }
              }
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