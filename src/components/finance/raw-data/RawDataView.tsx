import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RawPaymentImport, PaymentAssignmentResult } from "@/components/finance/types/transaction.types";
import { PaymentAssignmentCard } from "./components/PaymentAssignmentCard";
import { PaymentTable } from "./components/PaymentTable";

export const RawDataView = () => {
  const queryClient = useQueryClient();
  const [assignmentResults, setAssignmentResults] = useState<PaymentAssignmentResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawTransactions, isLoading } = useQuery({
    queryKey: ["raw-payment-imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_payment_imports")
        .select("*")
        .order("created_at", { ascending: false })
        .filter('is_valid', 'eq', false);

      if (error) throw error;
      return data as RawPaymentImport[];
    },
  });

  const totalAmount = rawTransactions?.reduce((sum, transaction) => 
    sum + (Number(transaction.Amount) || 0), 0) || 0;

  const analyzePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      setIsSubmitting(true);
      try {
        const payment = rawTransactions?.find(t => t.id === paymentId);
        if (!payment) throw new Error("Payment not found");

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
            payment_method: payment.Payment_Method,
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
          .eq('id', paymentId);

        if (updateError) throw updateError;

        // Log the assignment
        setAssignmentResults(prev => [...prev, {
          success: true,
          agreementNumber: payment.Agreement_Number,
          amountAssigned: payment.Amount,
          timestamp: new Date().toISOString()
        }]);

        return { success: true };
      } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-payment-imports"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      toast.success("Payment assigned successfully");
    },
    onError: (error) => {
      console.error('Payment assignment error:', error);
      toast.error("Failed to assign payment");
    }
  });

  const analyzeAllPaymentsMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      try {
        const unprocessedPayments = rawTransactions?.filter(payment => !payment.is_valid) || [];
        
        for (const payment of unprocessedPayments) {
          await analyzePaymentMutation.mutateAsync(payment.id);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-payment-imports"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      toast.success("All payments assigned successfully");
    },
    onError: (error) => {
      console.error('Bulk payment assignment error:', error);
      toast.error("Failed to assign all payments");
    }
  });

  const cleanTableMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('raw_payment_imports')
        .delete()
        .filter('is_valid', 'eq', true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-payment-imports"] });
      toast.success("Table cleaned successfully - removed all processed payments");
      setAssignmentResults([]); // Clear assignment results
    },
    onError: (error) => {
      console.error('Clean table error:', error);
      toast.error("Failed to clean table");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasUnprocessedPayments = rawTransactions?.some(payment => !payment.is_valid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Raw Payment Import Data</h2>
        <div className="flex gap-2">
          {hasUnprocessedPayments && (
            <Button
              variant="default"
              onClick={() => analyzeAllPaymentsMutation.mutate()}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Analyze All
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => cleanTableMutation.mutate()}
            disabled={cleanTableMutation.isPending}
            className="flex items-center gap-2"
          >
            {cleanTableMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Clean Table
          </Button>
        </div>
      </div>

      <PaymentAssignmentCard 
        totalAmount={totalAmount}
        assignmentResults={assignmentResults}
      />

      <PaymentTable 
        rawTransactions={rawTransactions || []}
        onAnalyzePayment={(id) => analyzePaymentMutation.mutate(id)}
        isAnalyzing={isSubmitting}
      />
    </div>
  );
};