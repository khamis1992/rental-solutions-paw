import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RawPaymentImport } from "@/types/database/payment.types";
import { retryOperation } from "@/components/agreements/utils/retryUtils";

export const usePaymentAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const forceAssignPayment = async (payment: RawPaymentImport) => {
    try {
      console.log('Starting payment assignment for:', payment);

      const assignPaymentWithRetry = async () => {
        // First analyze the payment data
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
            console.log('Creating default agreement for:', payment.Agreement_Number);
            // Create default agreement if needed
            const { data: agreementData, error: agreementError } = await supabase
              .rpc('create_default_agreement_if_not_exists', {
                p_agreement_number: payment.Agreement_Number,
                p_customer_name: payment.Customer_Name,
                p_amount: payment.Amount
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
          throw new Error(`Failed to create payment: ${paymentError.message}`);
        }

        // Update raw payment import status
        const { error: updateError } = await supabase
          .from('raw_payment_imports')
          .update({ 
            is_valid: true,
            error_description: null // Clear any previous error
          })
          .eq('id', payment.id);

        if (updateError) throw updateError;

        return true;
      };

      // Use retry mechanism
      const success = await retryOperation(
        assignPaymentWithRetry,
        3, // max retries
        1000 // delay between retries in ms
      );

      if (success) {
        setAssignmentResults(prev => [...prev, {
          success: true,
          agreementNumber: payment.Agreement_Number,
          amountAssigned: payment.Amount,
          timestamp: new Date().toISOString()
        }]);
        toast.success(`Payment assigned to agreement ${payment.Agreement_Number}`);
      }

      return success;
    } catch (error) {
      console.error('Force assign error:', error);
      // Log the error details in raw_payment_imports
      await supabase
        .from('raw_payment_imports')
        .update({ 
          error_description: error instanceof Error ? error.message : 'Unknown error',
          is_valid: false 
        })
        .eq('id', payment.id);

      toast.error('Failed to assign payment');
      return false;
    }
  };

  const cleanupStuckPayments = async () => {
    try {
      setIsAssigning(true);
      console.log('Starting cleanup of stuck payments...');

      // Find payments that are marked as invalid but might be duplicates
      const { data: stuckPayments, error: fetchError } = await supabase
        .from('raw_payment_imports')
        .select('*')
        .eq('is_valid', false);

      if (fetchError) throw fetchError;

      let cleanedCount = 0;
      for (const payment of (stuckPayments || [])) {
        // Check if this payment already exists in the payments table
        const { data: existingPayment, error: checkError } = await supabase
          .from('payments')
          .select('id')
          .eq('transaction_id', payment.Transaction_ID)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking existing payment:', checkError);
          continue;
        }

        if (existingPayment) {
          // Payment exists, mark as valid in raw_payment_imports
          const { error: updateError } = await supabase
            .from('raw_payment_imports')
            .update({ 
              is_valid: true,
              error_description: 'Payment already exists in system'
            })
            .eq('id', payment.id);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            continue;
          }

          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        toast.success(`Cleaned up ${cleanedCount} stuck payments`);
        await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
      }

    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup stuck payments');
    } finally {
      setIsAssigning(false);
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
      const batchSize = 5; // Process in smaller batches
      const batches = [];
      
      // Split into batches
      for (let i = 0; i < (unprocessedPayments || []).length; i += batchSize) {
        batches.push(unprocessedPayments.slice(i, i + batchSize));
      }

      // Process each batch
      for (const batch of batches) {
        const results = await Promise.all(
          batch.map(payment => forceAssignPayment(payment as RawPaymentImport))
        );
        successCount += results.filter(Boolean).length;
      }

      toast.success(`Successfully assigned ${successCount} payments`);
      await queryClient.invalidateQueries({ queryKey: ['raw-payment-imports'] });
      
      // Run cleanup after bulk assignment
      await cleanupStuckPayments();
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
    forceAssignAllPayments,
    cleanupStuckPayments
  };
};