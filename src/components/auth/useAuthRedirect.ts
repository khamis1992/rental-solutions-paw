import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthChangeEvent } from "@supabase/supabase-js";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clear any stale tokens if no session exists
        if (!session) {
          localStorage.removeItem('sb-vqdlsidkucrownbfuouq-auth-token');
          localStorage.removeItem('sb-vqdlsidkucrownbfuouq-auth-refresh-token');
          return;
        }

        // Validate the session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User validation failed:", userError);
          await supabase.auth.signOut();
          toast.error("Session expired. Please login again.");
          navigate('/auth');
          return;
        }

        // Check user profile and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          await supabase.auth.signOut();
          toast.error("Failed to load user profile");
          navigate('/auth');
          return;
        }

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          navigate('/');
        } else {
          toast.error("Access denied. Only staff and admin users can access this system.");
          await supabase.auth.signOut();
          navigate('/auth');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        await supabase.auth.signOut();
        toast.error("Authentication failed. Please try again.");
        navigate('/auth');
      } finally {
        setIsInitializing(false);
      }
    };

    if (!isLoading) {
      initializeAuth();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          navigate('/');
        } else {
          toast.error("Access denied. Only staff and admin users can access this system.");
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, session, isLoading]);

  return { isInitializing, isLoading };
};