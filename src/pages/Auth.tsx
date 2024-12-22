import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const Auth = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Debug: Log initial auth state and localStorage
        console.log("Initializing auth state...");
        console.log("LocalStorage state:", {
          accessToken: localStorage.getItem('sb-vqdlsidkucrownbfuouq-auth-token'),
          refreshToken: localStorage.getItem('sb-vqdlsidkucrownbfuouq-auth-refresh-token')
        });
        
        // Check for existing session
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          toast.error("Failed to check authentication status");
          return;
        }

        // Debug: Log detailed session state
        console.log("Current session state:", {
          session: existingSession,
          hasSession: !!existingSession,
          userId: existingSession?.user?.id,
          tokenExpiry: existingSession?.expires_at
        });

        if (existingSession) {
          console.log("Existing session found, validating session...");
          
          // Validate session token
          const { data: { user }, error: tokenError } = await supabase.auth.getUser();
          
          if (tokenError) {
            console.error("Token validation failed:", tokenError);
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
            return;
          }

          console.log("Session validated, checking profile...");
          
          // Fetch user profile with detailed error handling
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();

          // Debug: Log profile check results
          console.log("Profile check result:", { 
            profile, 
            profileError,
            errorCode: profileError?.code,
            errorMessage: profileError?.message 
          });

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              console.log("Profile not found, creating new profile...");
              // Create new profile for user
              const { error: createError } = await supabase
                .from('profiles')
                .insert([
                  { 
                    id: existingSession.user.id,
                    full_name: existingSession.user.user_metadata.full_name,
                    role: 'customer' // Default role
                  }
                ]);

              if (createError) {
                console.error("Failed to create profile:", createError);
                toast.error("Failed to create user profile");
                await supabase.auth.signOut();
                return;
              }
              
              console.log("New profile created successfully");
            } else {
              console.error("Profile fetch error:", profileError);
              toast.error("Failed to load user profile");
              await supabase.auth.signOut();
              return;
            }
          }

          // Validate user role
          if (profile?.role === 'admin' || profile?.role === 'staff') {
            console.log("Valid role found, redirecting to dashboard");
            navigate('/');
          } else {
            console.log("Invalid role, signing out");
            toast.error("Access denied. Only staff and admin users can access this system.");
            await supabase.auth.signOut();
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast.error("Authentication system initialization failed");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes with enhanced debugging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { 
        event, 
        session,
        userId: session?.user?.id,
        tokenExpiry: session?.expires_at
      });
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in detected, validating profile and role...");
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log("Profile validation result:", { profile, profileError });

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          console.log("Valid role confirmed, redirecting to dashboard");
          navigate('/');
        } else {
          console.log("Invalid role detected, signing out");
          toast.error("Access denied. Only staff and admin users can access this system.");
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing session data");
        // Clear any additional session data if needed
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading state
  if (isInitializing || isLoading) {
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
      <div className="m-auto w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to Rental Solutions</h1>
            <p className="text-gray-600">Please sign in to continue</p>
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
              }
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </Card>
      </div>
    </div>
  );
};

export default Auth;