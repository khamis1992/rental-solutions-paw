import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session) {
        // If not on auth page, redirect to auth
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
        return;
      }

      // Get user role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const currentPath = window.location.pathname;
      
      // Handle routing based on role
      if (profile?.role === 'customer') {
        // If customer tries to access anything other than customer portal, redirect them
        if (currentPath !== "/customer-portal" && currentPath !== "/auth") {
          navigate("/customer-portal");
        }
      } else if (profile?.role === 'admin' || profile?.role === 'staff') {
        // If admin/staff is on customer portal or auth, redirect to dashboard
        if (currentPath === "/customer-portal") {
          navigate("/");
        }
      }
    };

    checkUserRole();
  }, [session, navigate]);

  return <>{children}</>;
};