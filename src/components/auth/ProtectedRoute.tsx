import { ReactNode, useEffect, useState } from "react";
import { Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteWrapper } from "@/components/layout/RouteWrapper";
import { AuthGuard } from "./AuthGuard";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session } = useSessionContext();
  const location = useLocation();
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCustomerRole = async () => {
      if (!session?.user?.id) {
        setIsCustomer(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setIsCustomer(data?.role === 'customer');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsCustomer(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCustomerRole();
  }, [session]);

  if (isLoading) {
    return <Skeleton className="h-screen w-screen" />;
  }

  if (isCustomer && location.pathname !== '/customer-portal') {
    toast.error('Access restricted. Redirecting to customer portal.');
    return <Navigate to="/customer-portal" replace />;
  }

  return (
    <AuthGuard>
      <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
        <RouteWrapper>{children}</RouteWrapper>
      </Suspense>
    </AuthGuard>
  );
};