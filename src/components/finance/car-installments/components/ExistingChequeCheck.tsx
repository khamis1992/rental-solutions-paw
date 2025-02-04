import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface ExistingChequeCheckProps {
  contractId: string;
  chequeNumbers: string[];
}

export function ExistingChequeCheck({ contractId, chequeNumbers }: ExistingChequeCheckProps) {
  const { data: existingCheques, isLoading } = useQuery({
    queryKey: ['existing-cheques', contractId, chequeNumbers],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_installment_payments')
        .select('cheque_number')
        .eq('contract_id', contractId)
        .in('cheque_number', chequeNumbers);

      if (error) throw error;
      return data.map(d => d.cheque_number);
    },
    enabled: chequeNumbers.length > 0
  });

  if (isLoading) {
    return <Alert>Checking existing cheques...</Alert>;
  }

  const duplicates = existingCheques || [];
  const hasDuplicates = duplicates.length > 0;

  return (
    <Alert variant={hasDuplicates ? "destructive" : "default"}>
      <AlertDescription className="flex items-center gap-2">
        {hasDuplicates ? (
          <>
            <XCircle className="h-4 w-4" />
            The following cheque numbers already exist: {duplicates.join(", ")}
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            All cheque numbers are available
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}