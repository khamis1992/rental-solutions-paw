import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RawPaymentImport } from "@/components/finance/types/transaction.types";
import { retryOperation } from "@/components/agreements/utils/retryUtils";

export const usePaymentAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const forceAssignPayment = async (payment: RawPaymentImport) => {
    try {
      console.log('Starting payment assignment for:', payment);

      const assignPaymentWithRetry = async () => {
        const { data: analysisResult, error: analysisError } = await supabase.functions
          .invoke('analyze-payment-import', {
            body: { payment }
          });

        if (analysisError) {
          console.error('Analysis error:', analysisError);
          throw new Error(`Failed to analyze payment: ${analysisError.message}`);
        }

        if (!analysisResult.success) {
          if (analysisResult.shouldCreateAgreement) {
            console.log('Creating default agreement for:', payment.agreement_number);
            const { data: agreementData, error: agreementError } = await supabase
              .rpc('create_default_agreement_if_not_exists', {
                p_agreement_number: payment.agreement_number,
                p_customer_name: payment.customer_name,
                p_amount: payment.amount
              });

            if (agreementError) {
              console.error('Agreement creation error:', agreementError);
              throw new Error(`Failed to create agreement: ${agreementError.message}`);
            }

            analysisResult.normalizedPayment.lease_id = agreementData;
          } else {
            throw new Error(analysisResult.error || 'Unknown analysis error');
          }
        }

        const { data: paymentData, error: paymentError } = await supabase
          .from('unified_payments')
          .insert({
            lease_id: analysisResult.normalizedPayment.lease_id,
            amount: payment.amount,
            payment_method: payment.payment_method as "Invoice" | "Cash" | "WireTransfer" | "Cheque" | "Deposit" | "On_hold",
            payment_date: payment.payment_date,
            status: 'completed',
            description: payment.description,
            type: payment.type,
            transaction_id: payment.transaction_id
          });

        if (paymentError) {
          console.error('Payment creation error:', paymentError);
          throw new Error(`Failed to create payment: ${paymentError.message}`);
        }

        await updatePaymentStatus(payment.id, true);
        return true;
      };

      const success = await retryOperation(assignPaymentWithRetry);

      if (success) {
        setAssignmentResults(prev => [...prev, {
          success: true,
          agreementNumber: payment.agreement_number,
          amountAssigned: payment.amount,
          timestamp: new Date().toISOString()
        }]);
        toast.success(`Payment assigned to agreement ${payment.agreement_number}`);
        
        await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      }

      return success;
    } catch (error) {
      console.error('Force assign error:', error);
      await updatePaymentStatus(
        payment.id, 
        false, 
        error instanceof Error ? error.message : 'Unknown error'
      );
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
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < (unprocessedPayments || []).length; i += batchSize) {
        batches.push(unprocessedPayments.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const results = await Promise.all(
          batch.map(payment => forceAssignPayment(payment as RawPaymentImport))
        );
        successCount += results.filter(Boolean).length;
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
    assignmentResults,
    forceAssignPayment,
    forceAssignAllPayments
  };
};

const updatePaymentStatus = async (id: string, isValid: boolean, errorDescription?: string) => {
  const { error: updateError } = await supabase
    .from('raw_payment_imports')
    .update({ 
      is_valid: isValid,
      error_description: errorDescription 
    })
    .eq('id', id);

  if (updateError) throw updateError;
};