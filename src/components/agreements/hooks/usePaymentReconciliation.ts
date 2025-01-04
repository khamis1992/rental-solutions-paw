import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment/paymentService';
import { toast } from 'sonner';

export const usePaymentReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const queryClient = useQueryClient();

  const reconcilePayments = async (agreementId: string) => {
    setIsReconciling(true);
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('lease_id', agreementId)
        .eq('status', 'pending');

      if (!payments?.length) {
        toast.info('No pending payments to reconcile');
        return;
      }

      for (const payment of payments) {
        await paymentService.reconcilePayment(payment.id);
      }

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      
      toast.success('Payments reconciled successfully');
    } catch (error) {
      console.error('Reconciliation error:', error);
      toast.error('Failed to reconcile payments');
      throw error;
    } finally {
      setIsReconciling(false);
    }
  };

  return {
    isReconciling,
    reconcilePayments
  };
};