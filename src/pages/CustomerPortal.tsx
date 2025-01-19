import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ProfileManagement } from '@/components/customers/portal/ProfileManagement';
import { PaymentHistory } from '@/components/customers/portal/PaymentHistory';
import { CustomerFeedback } from '@/components/customers/portal/CustomerFeedback';
import { Loader2 } from 'lucide-react';

const CustomerPortal = () => {
  const navigate = useNavigate();

  const { data: session } = await supabase.auth.getSession();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {profile && <ProfileManagement profile={profile} />}
          {session?.user?.id && <PaymentHistory customerId={session.user.id} />}
          <CustomerFeedback />
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;