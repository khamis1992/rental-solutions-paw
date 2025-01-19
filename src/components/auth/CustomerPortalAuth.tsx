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
            full_name,
            email,
            address,
            nationality
          )
        `)
        .eq('agreement_number', agreementNumber)
        .single();

      if (leaseError || !lease?.customer?.phone_number) {
        setError('Invalid agreement number');
        setIsLoading(false);
        return;
      }

      if (lease.customer.phone_number !== phoneNumber) {
        setError('Phone number does not match agreement');
        setIsLoading(false);
        return;
      }

      // First try to find if a user already exists with this phone number
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();

      if (existingUser) {
        // If user exists, try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${phoneNumber}@temporary.com`,
          password: agreementNumber
        });

        if (signInError) {
          setError('Error signing in');
          setIsLoading(false);
          return;
        }
      } else {
        // If user doesn't exist, create new account
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${phoneNumber}@temporary.com`,
          password: agreementNumber,
          options: {
            data: {
              id: lease.customer.id, // Important: Link to existing profile ID
              phone_number: phoneNumber,
              full_name: lease.customer.full_name,
              email: lease.customer.email,
              address: lease.customer.address,
              nationality: lease.customer.nationality
            }
          }
        });

        if (signUpError) {
          setError('Error creating account');
          setIsLoading(false);
          return;
        }
      }

      // Update the last_login timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          last_login: new Date().toISOString(),
          phone_number: phoneNumber // Ensure phone number is updated
        })
        .eq('id', lease.customer.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
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