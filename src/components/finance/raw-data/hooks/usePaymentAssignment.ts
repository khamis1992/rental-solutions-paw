import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RawPaymentImport } from "../../types/transaction.types";
import { retryOperation } from "../utils/retryUtils";
import { createDefaultAgreement, insertPayment, updatePaymentStatus } from "../utils/paymentUtils";

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
            console.log('Creating default agreement for:', payment.Agreement_Number);
            const agreementData = await createDefaultAgreement(payment);
            analysisResult.normalizedPayment.lease_id = agreementData;
          } else {
            throw new Error(analysisResult.error || 'Unknown analysis error');
          }
        }

        await insertPayment(analysisResult.normalizedPayment.lease_id, payment);
        await updatePaymentStatus(payment.id, true);

        return true;
      };

      const success = await retryOperation(assignPaymentWithRetry);

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
      await updatePaymentStatus(
        payment.id, 
        false, 
        error instanceof Error ? error.message : 'Unknown error'
      );
      toast.error('Failed to assign payment');
      return false;
    }
  };

  const cleanupStuckPayments = async () => {
    try {
      setIsAssigning(true);
      console.log('Starting cleanup of stuck payments...');

      const { data: stuckPayments, error: fetchError } = await supabase
        .from('raw_payment_imports')
        .select('*')
        .eq('is_valid', false);

      if (fetchError) throw fetchError;

      let cleanedCount = 0;
      for (const payment of (stuckPayments || [])) {
        const { data: existingPayment, error: checkError } = await supabase
          .from('payments')
          .select('id')
          .eq('transaction_id', payment.Transaction_ID)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing payment:', checkError);
          continue;
        }

        if (existingPayment) {
          await updatePaymentStatus(payment.id, true, 'Payment already exists in system');
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
