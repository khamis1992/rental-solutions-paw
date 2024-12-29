import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthStateHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Setting up auth state handler");
    console.log("Current location:", location.pathname);
    console.log("Import in progress:", sessionStorage.getItem('importInProgress'));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { 
        event, 
        userId: session?.user?.id,
        currentPath: location.pathname,
        importInProgress: sessionStorage.getItem('importInProgress')
      });
      
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          variant: "default",
        });
        
        // Only redirect to dashboard from auth page
        if (location.pathname === '/auth') {
          // Check if we're not in the middle of an import
          const importInProgress = sessionStorage.getItem('importInProgress');
          if (!importInProgress || importInProgress === 'completed') {
            console.log("Redirecting to dashboard after sign in");
            navigate('/');
          } else {
            console.log("Import in progress, skipping redirect");
          }
        }
      } else if (event === "SIGNED_OUT") {
        // Clear any import progress when signing out
        sessionStorage.removeItem('importInProgress');
        toast({
          title: "You have been logged out.",
          variant: "default",
        });
        navigate('/auth');
      }
    });

    return () => {
      console.log("Cleaning up auth state handler");
      subscription.unsubscribe();
    };
  }, [toast, navigate, location.pathname]);

  return null;
};