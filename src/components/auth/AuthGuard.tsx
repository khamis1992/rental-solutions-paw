import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if not on auth or customer portal
    if (!session && 
        window.location.pathname !== "/auth" && 
        window.location.pathname !== "/customer-portal") {
      navigate("/auth");
    }
  }, [session, navigate]);

  return <>{children}</>;
};