import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SettlementPaymentDialog } from "./SettlementPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceiptViewer } from "@/components/finance/receipts/ReceiptViewer";

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
            profiles!inner (
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
      {settlements.map((settlement) => {
        const totalPaid = settlement.settlement_payments?.reduce(
          (sum: number, payment: any) => sum + (payment.amount || 0),
          0
        );

        return (
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
                <p className="text-sm text-muted-foreground">
                  Customer: {settlement.legal_cases.profiles.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Case Type: {settlement.legal_cases.case_type}
                </p>
                <p className="text-sm text-muted-foreground">
                  Case Created: {format(new Date(settlement.legal_cases.created_at), "PPP")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  defaultValue={settlement.status}
                  onValueChange={(value) => handleStatusChange(settlement.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="secondary"
                  className={
                    settlement.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {settlement.status}
                </Badge>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium">Terms:</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {settlement.terms}
              </p>
            </div>
            {settlement.payment_plan && typeof settlement.payment_plan === 'object' && (
              <div className="text-sm">
                <p className="font-medium">Payment Plan:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {(settlement.payment_plan as { description?: string })?.description || 'No description available'}
                </p>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>
                Paid Amount: {formatCurrency(totalPaid)} /{" "}
                {formatCurrency(settlement.total_amount)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSettlement(settlement.id);
                  setShowPaymentDialog(true);
                }}
              >
                Record Payment
              </Button>
              {settlement.receipt_url && (
                <ReceiptViewer
                  url={settlement.receipt_url}
                  fileName="Settlement Receipt"
                />
              )}
            </div>
            {settlement.settlement_payments?.length > 0 && (
              <div className="text-sm">
                <p className="font-medium">Payment History:</p>
                <div className="space-y-2 mt-2">
                  {settlement.settlement_payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center bg-muted/50 p-2 rounded"
                    >
                      <div>
                        <p>{format(new Date(payment.payment_date), "PPP")}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      {payment.receipt_url && (
                        <ReceiptViewer
                          url={payment.receipt_url}
                          fileName={`Payment Receipt - ${format(
                            new Date(payment.payment_date),
                            "PPP"
                          )}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
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