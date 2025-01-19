import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { PaymentHistory } from '@/components/customers/portal/PaymentHistory';
import { CustomerFeedback } from '@/components/customers/portal/CustomerFeedback';
import { ProfileManagement } from '@/components/customers/portal/ProfileManagement';
import { toast } from 'sonner';

export default function CustomerPortal() {
  const [agreementNumber, setAgreementNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('handle_portal_login', {
        p_agreement_number: agreementNumber,
        p_phone_number: phoneNumber
      });

      if (error) throw error;

      if (data.success) {
        setIsAuthenticated(true);
        // Get agreement details for the profile
        const { data: agreementData } = await supabase
          .from('leases')
          .select(`
            *,
            customer:customer_id (
              id,
              full_name,
              phone_number,
              email,
              address,
              nationality
            )
          `)
          .eq('agreement_number', agreementNumber)
          .single();

        if (agreementData) {
          setProfile(agreementData.customer);
        }
        toast.success('Login successful');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && profile) {
    return (
      <div className="min-h-screen bg-background-alt">
        <div className="container py-8 space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-secondary">Welcome, {profile?.full_name}</h1>
            <p className="text-muted-foreground">Manage your rentals and account details</p>
          </div>

          {/* Profile Management Section */}
          <ProfileManagement profile={profile} />

          {/* Payment History Section */}
          {profile?.id && (
            <PaymentHistory customerId={profile.id} />
          )}

          {/* Feedback Section */}
          <CustomerFeedback agreementId={agreementNumber} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Customer Portal Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agreementNumber">Agreement Number</Label>
              <Input
                id="agreementNumber"
                placeholder="Enter your agreement number"
                value={agreementNumber}
                onChange={(e) => setAgreementNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}