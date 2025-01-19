import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const phoneNumber = location.state?.phoneNumber;
  const agreementNumber = location.state?.agreementNumber;

  useEffect(() => {
    if (!phoneNumber || !agreementNumber) {
      navigate('/auth');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, agreementNumber, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms'
      });

      if (error) {
        toast.error('Invalid verification code');
        return;
      }

      toast.success('Successfully verified');
      navigate('/portal');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        toast.error('Error resending code');
        return;
      }

      toast.success('New verification code sent');
      setCountdown(60);
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Error resending verification code');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md p-4">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Verify Phone Number</h1>
            <p className="text-gray-600">
              Enter the verification code sent to {phoneNumber}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="w-full"
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-sm"
              >
                {countdown > 0
                  ? `Resend code in ${countdown}s`
                  : 'Resend verification code'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};