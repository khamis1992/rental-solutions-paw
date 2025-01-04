import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RawPaymentImport, PaymentMethodType } from "@/components/finance/types/transaction.types";
import { normalizePaymentMethod } from "../utils/paymentUtils";

export const usePaymentAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  const forceAssignPayment = async (payment: RawPaymentImport) => {
    try {
      const { data: lease } = await supabase
        .from('leases')
        .select('id')
        .eq('agreement_number', payment.Agreement_Number)
        .single();

      if (!lease) {
        toast.error(`No agreement found with number ${payment.Agreement_Number}`);
        return false;
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          lease_id: lease.id,
          amount: payment.Amount,
          payment_method: normalizePaymentMethod(payment.Payment_Method),
          payment_date: payment.Payment_Date,
          status: "completed",
          description: payment.Description,
          type: payment.Type
        });

      if (paymentError) {
        console.error('Payment insert error:', paymentError);
        toast.error(`Failed to create payment for agreement ${payment.Agreement_Number}`);
        return false;
      }

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