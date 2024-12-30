import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import { Suspense } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  session: any | null;
}

export const ProtectedRoute = ({ children, session }: ProtectedRouteProps) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
      <RouteWrapper>{children}</RouteWrapper>
    </Suspense>
  );
};