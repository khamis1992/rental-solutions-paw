import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user) {
        navigate("/auth");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(profile?.role || null);

        // Only redirect if we're not already on the customer portal
        if (profile?.role === "customer" && window.location.pathname !== "/customer-portal") {
          navigate("/customer-portal");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }

      setIsLoading(false);
    };

    checkUserRole();
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access to auth and customer portal without restrictions
  if (window.location.pathname === "/auth" || window.location.pathname === "/customer-portal") {
    return <>{children}</>;
  }

  // For customer users, only allow access to customer portal
  if (userRole === "customer" && window.location.pathname !== "/customer-portal") {
    navigate("/customer-portal");
    return null;
  }

  return <>{children}</>;
};