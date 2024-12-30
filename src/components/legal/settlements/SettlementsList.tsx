import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface SettlementsListProps {
  caseId: string;
}

export const SettlementsList = ({ caseId }: SettlementsListProps) => {
  const { data: settlements, isLoading } = useQuery({
    queryKey: ["legal-settlements", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_settlements")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
        <div
          key={settlement.id}
          className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">
                Amount: {formatCurrency(settlement.total_amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Created: {format(new Date(settlement.created_at), "PPP")}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={
                settlement.status === "signed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {settlement.status}
            </Badge>
          </div>
          <div className="text-sm">
            <p className="font-medium">Terms:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {settlement.terms}
            </p>
          </div>
          {settlement.payment_plan && (
            <div className="text-sm">
              <p className="font-medium">Payment Plan:</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {settlement.payment_plan.description}
              </p>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <p>
              Paid Amount: {formatCurrency(settlement.paid_amount || 0)} /{" "}
              {formatCurrency(settlement.total_amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};