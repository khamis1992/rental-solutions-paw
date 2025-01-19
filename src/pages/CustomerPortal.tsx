import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileManagement } from "@/components/customers/portal/ProfileManagement";
import { PaymentHistory } from "@/components/customers/portal/PaymentHistory";
import { CustomerFeedback } from "@/components/customers/portal/CustomerFeedback";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const CustomerPortal = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/customer-portal/auth");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Customer Portal</h1>
      
      <div className="grid gap-8">
        <ProfileManagement />
        <PaymentHistory customerId={session.user.id} />
        <CustomerFeedback customerId={session.user.id} />
      </div>
    </div>
  );
};

export default CustomerPortal;