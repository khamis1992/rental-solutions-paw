import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CustomerPortalAuth = () => {
  const navigate = useNavigate();
  const [agreementNumber, setAgreementNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First verify the agreement number and phone number match
      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .select(`
          id,
          customer:profiles(
            id,
            phone_number,
            portal_username,
            portal_password
          )
        `)
        .eq('agreement_number', agreementNumber)
        .single();

      if (leaseError || !lease?.customer?.phone_number) {
        setError('Invalid agreement number');
        return;
      }

      if (lease.customer.phone_number !== phoneNumber) {
        setError('Phone number does not match agreement');
        return;
      }

      // Use the phone number as username and agreement number as password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${phoneNumber}@temporary.com`,
        password: agreementNumber
      });

      if (signInError) {
        // If user doesn't exist, sign them up
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${phoneNumber}@temporary.com`,
          password: agreementNumber,
          options: {
            data: {
              phone_number: phoneNumber,
              agreement_number: agreementNumber
            }
          }
        });

        if (signUpError) {
          setError('Error creating account');
          return;
        }
      }

      toast.success('Login successful');
      navigate('/customer-portal');

    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agreementNumber">Agreement Number</Label>
                <Input
                  id="agreementNumber"
                  value={agreementNumber}
                  onChange={(e) => setAgreementNumber(e.target.value)}
                  placeholder="Enter your agreement number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};