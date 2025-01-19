import { ReactNode } from "react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import { AuthGuard } from "./AuthGuard";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return (
    <AuthGuard>
      <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
        <RouteWrapper>{children}</RouteWrapper>
      </Suspense>
    </AuthGuard>
  );
};