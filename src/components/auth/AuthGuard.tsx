import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "@/hooks/use-auth-state";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const AuthGuard = ({ children, requiredRoles = [] }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, userRole } = useAuthState();
  const location = useLocation();

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && (!userRole || !requiredRoles.includes(userRole))) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};