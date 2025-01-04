import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RawPaymentImport } from "@/components/finance/types/transaction.types";

export const usePaymentAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  const forceAssignPayment = async (payment: RawPaymentImport) => {
    try {
      console.log('Starting payment assignment for:', payment);

      // First analyze the payment data
      const { data: analysisResult, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: { payment }
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.error(`Failed to analyze payment: ${analysisError.message}`);
        return false;
      }

      if (!analysisResult.success) {
        if (analysisResult.shouldCreateAgreement) {
          // Create default agreement if needed
          const { data: agreementData, error: agreementError } = await supabase
            .rpc('create_default_agreement_if_not_exists', {
              p_agreement_number: payment.Agreement_Number,
              p_customer_name: payment.Customer_Name,
              p_amount: payment.Amount
            });

          if (agreementError) {
            console.error('Agreement creation error:', agreementError);
            toast.error(`Failed to create agreement: ${agreementError.message}`);
            return false;
          }

          analysisResult.normalizedPayment.lease_id = agreementData;
        } else {
          toast.error(analysisResult.error);
          return false;
        }
      }

      // Insert normalized payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          lease_id: analysisResult.normalizedPayment.lease_id,
          amount: analysisResult.normalizedPayment.Amount,
          payment_method: analysisResult.normalizedPayment.Payment_Method,
          payment_date: analysisResult.normalizedPayment.Payment_Date,
          status: 'completed',
          description: analysisResult.normalizedPayment.Description,
          type: analysisResult.normalizedPayment.Type
        });

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
        toast.error(`Failed to create payment: ${paymentError.message}`);
        return false;
      }

      // Update raw payment import status
      const { error: updateError } = await supabase
        .from('raw_payment_imports')
        .update({ is_valid: true })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return false;
      }

      toast.success(`Payment assigned to agreement ${payment.Agreement_Number}`);
      return true;
    } catch (error) {
      console.error('Force assign error:', error);
      toast.error('Failed to assign payment');
      return false;
    }
  };

  const forceAssignAllPayments = async () => {
    setIsAssigning(true);
    try {
      const { data: unprocessedPayments, error: fetchError } = await supabase
        .from('raw_payment_imports')
        .select('*')
        .eq('is_valid', false);

      if (fetchError) throw fetchError;

      let successCount = 0;
      for (const payment of (unprocessedPayments || [])) {
        const success = await forceAssignPayment(payment as RawPaymentImport);
        if (success) successCount++;
      }

      toast.success(`Successfully assigned ${successCount} payments`);
      await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error('Failed to assign payments');
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    isAssigning,
    forceAssignAllPayments
  };
};