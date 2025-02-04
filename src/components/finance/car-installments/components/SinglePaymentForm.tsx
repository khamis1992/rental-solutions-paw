import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SinglePaymentFormProps {
  contractId: string;
  onSuccess?: () => void;
}

export function SinglePaymentForm({ contractId, onSuccess }: SinglePaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Attempting to insert payment for contract:', contractId);
      
      const { data, error } = await supabase
        .from('car_installment_payments')
        .insert({
          contract_id: contractId,
          cheque_number: '12345',
          amount: 5000,
          payment_date: new Date().toISOString().split('T')[0],
          drawee_bank: 'Test Bank',
          paid_amount: 5000,
          remaining_amount: 0,
          status: 'completed'
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting payment:', error);
        throw error;
      }

      console.log('Successfully inserted payment:', data);
      toast.success("Payment added successfully");
      onSuccess?.();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Test Payment Form</Label>
        <p className="text-sm text-muted-foreground mb-4">
          This will create a test payment of 5,000 QAR for the selected contract.
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Adding Payment..." : "Add Test Payment"}
      </Button>
    </form>
  );
}