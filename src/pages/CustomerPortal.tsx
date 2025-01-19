import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CustomerFeedback } from "@/components/customers/portal/CustomerFeedback";
import { PaymentHistory } from "@/components/customers/portal/PaymentHistory";
import { ProfileManagement } from "@/components/customers/portal/ProfileManagement";
import { Loader2 } from "lucide-react";

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

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/customer-portal/auth");
      } else if (session) {
        setUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["customerProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone_number,
          email,
          address,
          nationality,
          portal_username,
          last_login
        `)
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      // Update last login
      if (data) {
        await supabase
          .from("profiles")
          .update({ last_login: new Date().toISOString() })
          .eq("id", userId);
      }

      return data;
    },
    enabled: !!userId,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Error loading profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-500">
          Profile not found. Please contact support.
        </div>
      </div>
    );
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