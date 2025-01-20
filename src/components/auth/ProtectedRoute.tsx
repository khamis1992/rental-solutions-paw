import { ReactNode } from "react";
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

  // Check if user is a customer
  const checkCustomerRole = async () => {
    if (!session?.user?.id) return false;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data?.role === 'customer';
  };

  // Handle customer access
  const handleCustomerAccess = async () => {
    const isCustomer = await checkCustomerRole();
    
    if (isCustomer) {
      // If customer is trying to access any route other than customer portal
      if (location.pathname !== '/customer-portal') {
        toast.error('Access restricted. Redirecting to customer portal.');
        return <Navigate to="/customer-portal" replace />;
      }
    }
    
    return (
      <AuthGuard>
        <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
          <RouteWrapper>{children}</RouteWrapper>
        </Suspense>
      </AuthGuard>
    );
  };

  return handleCustomerAccess();
};