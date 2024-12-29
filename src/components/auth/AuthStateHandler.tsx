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
        
        // Only redirect to dashboard if we're on the auth page and not importing
        if (location.pathname === '/auth' && !sessionStorage.getItem('importInProgress')) {
          console.log("Redirecting to dashboard after sign in");
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
      console.log("Cleaning up auth state handler");
      subscription.unsubscribe();
    };
  }, [toast, navigate, location.pathname]);

  return null;
};