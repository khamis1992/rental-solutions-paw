import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { SettlementPaymentDialog } from "./SettlementPaymentDialog";
import { SettlementCard } from "./SettlementCard";

interface SettlementsListProps {
  caseId: string;
}

export const SettlementsList = ({ caseId }: SettlementsListProps) => {
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: settlements, isLoading } = useQuery({
    queryKey: ["legal-settlements", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_settlements")
        .select(`
          *,
          legal_cases!inner (
            case_type,
            created_at,
            customer:profiles!legal_cases_customer_id_fkey (
              full_name
            )
          ),
          settlement_payments (*)
        `)
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleStatusChange = async (settlementId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("legal_settlements")
        .update({ status: newStatus })
        .eq("id", settlementId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating settlement status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settlements?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No settlement agreements found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settlements.map((settlement) => (
        <SettlementCard
          key={settlement.id}
          settlement={settlement}
          onStatusChange={handleStatusChange}
          onRecordPayment={(settlementId) => {
            setSelectedSettlement(settlementId);
            setShowPaymentDialog(true);
          }}
        />
      ))}
      {selectedSettlement && (
        <SettlementPaymentDialog
          settlementId={selectedSettlement}
          caseId={caseId}
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
        />
      )}
    </div>
  );
};