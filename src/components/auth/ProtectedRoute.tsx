import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (window.location.pathname === "/auth" || window.location.pathname === "/customer-portal") {
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          navigate("/auth");
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          toast.error("Error fetching user profile");
          navigate("/auth");
          return;
        }

        setUserRole(profile?.role || null);

        if (profile?.role === "customer" && window.location.pathname !== "/customer-portal") {
          navigate("/customer-portal");
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        toast.error("An error occurred while checking user access");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
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

  return <>{children}</>;
};