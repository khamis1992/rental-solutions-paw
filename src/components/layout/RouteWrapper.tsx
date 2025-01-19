import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface RouteWrapperProps {
  children: ReactNode;
}

export function RouteWrapper({ children }: RouteWrapperProps) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}