import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Routes } from "@/routes/routes";
import { supabase } from "@/integrations/supabase/client";

export default function App() {
  const { session, isLoading, error } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        // Refresh the session to ensure we have valid JWT
        supabase.auth.refreshSession();
      }
    });

    // Handle session errors
    if (error) {
      console.error('Session error:', error);
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('session_not_found')) {
        toast.error('Your session has expired. Please sign in again.');
        supabase.auth.signOut().then(() => {
          navigate('/auth');
        });
      }
    }

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [error, navigate]);

  // Show loading state
  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-solutions-theme">
      <Routes />
      <Toaster />
    </ThemeProvider>
  );
}