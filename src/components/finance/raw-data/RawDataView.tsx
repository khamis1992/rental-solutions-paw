import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentActions } from "./components/PaymentActions";
import { PaymentTable } from "./components/PaymentTable";
import { usePaymentAssignment } from "./hooks/usePaymentAssignment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedImportTracking } from "@/components/finance/types/transaction.types";

export const RawDataView = () => {
  const { isAssigning, forceAssignAllPayments } = usePaymentAssignment();

  const { data: unprocessedPayments, isLoading } = useQuery({
    queryKey: ['unified-import-tracking', 'unprocessed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_import_tracking')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UnifiedImportTracking[];
    }
  });

  const handleCleanTable = async () => {
    const { error } = await supabase
      .from('unified_import_tracking')
      .delete()
      .eq('status', 'completed');

    if (error) {
      console.error('Error cleaning table:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Raw Payment Import Data</CardTitle>
        <PaymentActions
          hasUnprocessedPayments={!!(unprocessedPayments?.length)}
          onAnalyzeAll={forceAssignAllPayments}
          onCleanTable={handleCleanTable}
          isSubmitting={isAssigning}
          cleanTableMutationIsPending={false}
          onCleanupStuck={() => {}}
        />
      </CardHeader>
      <CardContent>
        <PaymentTable
          rawTransactions={unprocessedPayments || []}
          isAnalyzing={isLoading}
          onAnalyzePayment={() => {}}
          onRefresh={() => {}}
        />
      </CardContent>
    </Card>
  );
};