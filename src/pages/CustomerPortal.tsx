import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileManagement } from "@/components/customers/portal/ProfileManagement";
import { PaymentHistory } from "@/components/customers/portal/PaymentHistory";
import { CustomerFeedback } from "@/components/customers/portal/CustomerFeedback";

const CustomerPortal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/customer-portal/auth');
      }
    };

    checkSession();
  }, [navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customer Portal</h1>
      <div className="grid gap-6">
        <ProfileManagement profile={profile} />
        <PaymentHistory customerId={profile.id} />
        <CustomerFeedback customerId={profile.id} />
      </div>
    </div>
  );
};

export default CustomerPortal;