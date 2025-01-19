import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CustomerFeedback } from "@/components/customers/portal/CustomerFeedback";
import { PaymentHistory } from "@/components/customers/portal/PaymentHistory";
import { ProfileManagement } from "@/components/customers/portal/ProfileManagement";

export const CustomerPortal = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/customer-portal/auth");
        return;
      }
      setUserId(session.user.id);
    };

    checkSession();
  }, [navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["customerProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Customer Portal</h1>
      
      <div className="grid gap-8">
        <ProfileManagement profile={profile} />
        <PaymentHistory customerId={profile.id} />
        <CustomerFeedback customerId={profile.id} />
      </div>
    </div>
  );
};

export default CustomerPortal;