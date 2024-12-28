import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useSessionContext();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          toast.error("Failed to check authentication status");
          return;
        }

        if (existingSession) {
          console.log("Existing session found, validating session...");
          
          const { data: { user }, error: tokenError } = await supabase.auth.getUser();
          
          if (tokenError) {
            console.error("Token validation failed:", tokenError);
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
            return;
          }

          // Only redirect to dashboard if explicitly on the auth page
          if (location.pathname === '/auth') {
            console.log("Valid session found on auth page, redirecting to dashboard");
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast.error("Authentication system initialization failed");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { 
        event, 
        session,
        userId: session?.user?.id,
        tokenExpiry: session?.expires_at,
        currentPath: location.pathname
      });
      
      if (event === 'SIGNED_IN' && session) {
        // Only redirect if on auth page
        if (location.pathname === '/auth') {
          console.log("Sign in detected on auth page, redirecting to dashboard");
          navigate('/');
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { isInitializing, isLoading };
};