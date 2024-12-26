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

          console.log("Session validated, checking profile...");
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              console.log("Profile not found, creating new profile...");
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
                await supabase.auth.signOut();
                return;
              }
            } else {
              console.error("Profile fetch error:", profileError);
              toast.error("Failed to load user profile");
              await supabase.auth.signOut();
              return;
            }
          }

          if (profile?.role === 'admin' || profile?.role === 'staff') {
            // Only redirect to dashboard if we're on the auth page
            if (location.pathname === '/auth') {
              console.log("Valid role found, redirecting to dashboard");
              navigate('/');
            }
          } else {
            console.log("Invalid role, signing out");
            toast.error("Access denied. Only staff and admin users can access this system.");
            await supabase.auth.signOut();
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
          // Only redirect to dashboard if we're on the auth page
          if (location.pathname === '/auth') {
            console.log("Valid role confirmed, redirecting to dashboard");
            navigate('/');
          }
        } else {
          console.log("Invalid role detected, signing out");
          toast.error("Access denied. Only staff and admin users can access this system.");
          await supabase.auth.signOut();
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