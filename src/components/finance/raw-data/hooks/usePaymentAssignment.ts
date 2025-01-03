import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RawPaymentImport, PaymentAssignmentResult } from '@/components/finance/types/transaction.types';

export const usePaymentAssignment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<PaymentAssignmentResult[]>([]);

  const assignPayment = async (payment: RawPaymentImport) => {
    try {
      setIsSubmitting(true);

      // Create or get agreement
      const { data: agreementData, error: agreementError } = await supabase
        .rpc('create_default_agreement_if_not_exists', {
          p_agreement_number: payment.Agreement_Number,
          p_customer_name: payment.Customer_Name,
          p_amount: payment.Amount
        });

      if (agreementError) throw agreementError;

      // Insert payment
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          lease_id: agreementData,
          amount: payment.Amount,
          payment_method: payment.Payment_Method as any,
          status: 'completed',
          payment_date: payment.Payment_Date,
          description: payment.Description,
          type: payment.Type
        });

      if (insertError) throw insertError;

      // Update raw payment import status
      const { error: updateError } = await supabase
        .from('raw_payment_imports')
        .update({ is_valid: true })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Log the assignment
      setAssignmentResults(prev => [...prev, {
        success: true,
        agreementNumber: payment.Agreement_Number,
        amountAssigned: payment.Amount,
        timestamp: new Date().toISOString()
      }]);

      toast.success('Payment assigned successfully');
      return true;
    } catch (error) {
      console.error('Payment assignment error:', error);
      toast.error('Failed to assign payment');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignAllPayments = async (payments: RawPaymentImport[]) => {
    setIsSubmitting(true);
    try {
      const unprocessedPayments = payments.filter(payment => !payment.is_valid);
      
      for (const payment of unprocessedPayments) {
        await assignPayment(payment);
      }
      toast.success('All payments assigned successfully');
    } catch (error) {
      console.error('Bulk payment assignment error:', error);
      toast.error('Failed to assign all payments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    assignmentResults,
    assignPayment,
    assignAllPayments
  };
};