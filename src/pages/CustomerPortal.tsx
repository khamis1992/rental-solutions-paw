import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { PaymentHistory } from '@/components/customers/portal/PaymentHistory';
import { CustomerFeedback } from '@/components/customers/portal/CustomerFeedback';

export default function CustomerPortal() {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            leases (
              id,
              agreement_number,
              status,
              start_date,
              end_date,
              total_amount,
              rent_amount
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeAgreement = profile?.leases?.find(lease => lease.status === 'active');

  return (
    <div className="min-h-screen bg-background-alt">
      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Welcome, {profile?.full_name}</h1>
          <p className="text-muted-foreground">Manage your rentals and account details</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {profile?.leases?.filter(lease => lease.status === 'active').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {profile?.leases?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary capitalize">
                {profile?.status || 'Active'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History Section */}
        {session?.user?.id && (
          <PaymentHistory customerId={session.user.id} />
        )}

        {/* Feedback Section */}
        <CustomerFeedback agreementId={activeAgreement?.id} />

        {/* Agreements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile?.leases?.length > 0 ? (
                profile.leases.map((lease) => (
                  <div
                    key={lease.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Agreement #{lease.agreement_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">QAR {lease.rent_amount}</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          lease.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lease.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No agreements found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}