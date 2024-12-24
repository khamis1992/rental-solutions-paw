import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define allowed origins for enhanced security
const ALLOWED_ORIGINS = [
  'https://preview--rental-solutions.lovable.app',
  'https://gptengineer.app',
  'http://localhost:3000',
  'https://lovable.dev'
];

// Helper to validate origins
const isValidOrigin = (origin: string): boolean => {
  return ALLOWED_ORIGINS.includes(origin);
};

// Helper to get the correct target origin
const getTargetOrigin = (): string => {
  const currentOrigin = window.location.origin;
  return isValidOrigin(currentOrigin) ? currentOrigin : ALLOWED_ORIGINS[0];
};

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check failed:", sessionError);
          toast.error("Authentication check failed");
          setIsInitializing(false);
          return;
        }

        if (existingSession) {
          const { data: { user }, error: tokenError } = await supabase.auth.getUser();
          
          if (tokenError) {
            console.error("Token validation failed:", tokenError);
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
            setIsInitializing(false);
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
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
                setIsInitializing(false);
                return;
              }
            } else {
              console.error("Profile fetch error:", profileError);
              toast.error("Failed to load user profile");
              await supabase.auth.signOut();
              setIsInitializing(false);
              return;
            }
          }

          if (profile?.role === 'admin' || profile?.role === 'staff') {
            navigate('/');
          } else {
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
      if (event === 'SIGNED_IN' && session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'staff') {
          const targetOrigin = getTargetOrigin();
          console.log('Sending postMessage to origin:', targetOrigin); // Debug log

          if (window.opener) {
            try {
              window.opener.postMessage(
                { type: 'SIGNED_IN', session },
                targetOrigin
              );
              console.log('PostMessage sent successfully'); // Debug log
            } catch (error) {
              console.error('PostMessage error:', error); // Error log
            }
          }
          navigate('/');
        } else {
          toast.error("Access denied. Only staff and admin users can access this system.");
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        const targetOrigin = getTargetOrigin();
        console.log('Sending SIGNED_OUT postMessage to origin:', targetOrigin); // Debug log

        if (window.opener) {
          try {
            window.opener.postMessage(
              { type: 'SIGNED_OUT' },
              targetOrigin
            );
            console.log('SIGNED_OUT PostMessage sent successfully'); // Debug log
          } catch (error) {
            console.error('SIGNED_OUT PostMessage error:', error); // Error log
          }
        }
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isInitializing, isLoading };
};