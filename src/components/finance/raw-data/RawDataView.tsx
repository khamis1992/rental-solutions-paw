import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { RawPaymentImport } from "../types/transaction.types";
import { PaymentAssignmentCard } from "./components/PaymentAssignmentCard";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentActions } from "./components/PaymentActions";
import { usePaymentAssignment } from "./hooks/usePaymentAssignment";

export const RawDataView = () => {
  const queryClient = useQueryClient();
  const [isCleaningTable, setIsCleaningTable] = useState(false);
  const { 
    isAssigning, 
    assignmentResults, 
    forceAssignPayment, 
    forceAssignAllPayments,
    cleanupStuckPayments 
  } = usePaymentAssignment();

  const { data: rawTransactions, isLoading, refetch } = useQuery({
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
    sum + (transaction.amount || 0), 0) || 0;

  const cleanTable = async () => {
    setIsCleaningTable(true);
    try {
      const { error } = await supabase
        .from('raw_payment_imports')
        .delete()
        .filter('is_valid', 'eq', true);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["raw-payment-imports"] });
      toast.success("Table cleaned successfully - removed all processed payments");
    } catch (error) {
      console.error('Clean table error:', error);
      toast.error('Failed to clean table');
    } finally {
      setIsCleaningTable(false);
    }
  };

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
        <PaymentActions
          hasUnprocessedPayments={hasUnprocessedPayments}
          onAnalyzeAll={forceAssignAllPayments}
          onCleanTable={cleanTable}
          onCleanupStuck={cleanupStuckPayments}
          isSubmitting={isAssigning}
          cleanTableMutationIsPending={isCleaningTable}
        />
      </div>

      <PaymentAssignmentCard 
        totalAmount={totalAmount}
        assignmentResults={assignmentResults}
      />

      <PaymentTable 
        rawTransactions={rawTransactions || []}
        onAnalyzePayment={(id) => {
          const payment = rawTransactions?.find(t => t.id === id);
          if (payment) {
            forceAssignPayment(payment);
          }
        }}
        isAnalyzing={isAssigning}
        onRefresh={refetch}
      />
    </div>
  );
};