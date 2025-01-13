import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedImportTracking, PaymentAssignmentResult, PaymentMethodType } from "@/components/finance/types/transaction.types";
import { retryOperation } from "@/components/agreements/utils/retryUtils";

export const usePaymentAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<PaymentAssignmentResult[]>([]);
  const queryClient = useQueryClient();

  const forceAssignPayment = async (payment: UnifiedImportTracking) => {
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

        const { error: paymentError } = await supabase
          .from('unified_payments')
          .insert({
            lease_id: analysisResult.normalizedPayment.lease_id,
            amount: payment.amount,
            payment_method: payment.payment_method as PaymentMethodType,
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

        // Update import tracking status
        const { error: updateError } = await supabase
          .from('unified_import_tracking')
          .update({ 
            status: 'completed',
            validation_status: true,
            last_processed_at: new Date().toISOString(),
            processing_attempts: (payment.processing_attempts || 0) + 1
          })
          .eq('id', payment.id);

        if (updateError) throw updateError;
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
        await queryClient.invalidateQueries({ queryKey: ['unified-import-tracking'] });
      }

      return success;
    } catch (error) {
      console.error('Force assign error:', error);
      await supabase
        .from('unified_import_tracking')
        .update({ 
          status: 'failed',
          error_details: error instanceof Error ? error.message : 'Unknown error',
          processing_attempts: (payment.processing_attempts || 0) + 1,
          last_processed_at: new Date().toISOString()
        })
        .eq('id', payment.id);
      
      toast.error('Failed to assign payment');
      return false;
    }
  };

  const forceAssignAllPayments = async () => {
    setIsAssigning(true);
    try {
      const { data: unprocessedPayments, error: fetchError } = await supabase
        .from('unified_import_tracking')
        .select('*')
        .eq('status', 'pending');

      if (fetchError) throw fetchError;

      let successCount = 0;
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < (unprocessedPayments || []).length; i += batchSize) {
        batches.push(unprocessedPayments.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const results = await Promise.all(
          batch.map(payment => forceAssignPayment(payment as UnifiedImportTracking))
        );
        successCount += results.filter(Boolean).length;
      }

      toast.success(`Successfully assigned ${successCount} payments`);
      await queryClient.invalidateQueries({ queryKey: ['unified-import-tracking'] });
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