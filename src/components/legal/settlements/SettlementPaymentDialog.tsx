import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ReceiptUpload } from "@/components/finance/receipts/ReceiptUpload";
import { TransactionType } from "@/components/finance/types/transaction.types";

interface SettlementPaymentDialogProps {
  settlementId: string;
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettlementPaymentDialog = ({
  settlementId,
  caseId,
  open,
  onOpenChange,
}: SettlementPaymentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get case and settlement details for audit
      const { data: caseData, error: caseError } = await supabase
        .from("legal_cases")
        .select(`
          *,
          customer:profiles!legal_cases_customer_id_fkey (
            full_name
          )
        `)
        .eq("id", caseId)
        .single();

      if (caseError) throw caseError;

      // Insert payment record
      const { error: paymentError } = await supabase
        .from("settlement_payments")
        .insert({
          settlement_id: settlementId,
          amount: parseFloat(formData.amount),
          notes: formData.notes,
        });

      if (paymentError) throw paymentError;

      // Create income transaction
      const { error: transactionError } = await supabase
        .from("accounting_transactions")
        .insert({
          amount: parseFloat(formData.amount),
          description: `Settlement payment from ${caseData.customer.full_name} - Case: ${caseData.case_type}`,
          transaction_date: new Date().toISOString(),
          reference_type: "settlement",
          reference_id: settlementId,
          type: TransactionType.INCOME
        });

      if (transactionError) throw transactionError;

      // Create audit log
      await supabase.from("audit_logs").insert({
        action: "settlement_payment",
        entity_type: "settlement",
        entity_id: settlementId,
        changes: {
          amount: formData.amount,
          customer_name: caseData.customer.full_name,
          case_type: caseData.case_type,
          case_created_at: caseData.created_at,
        },
      });

      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-settlements", caseId] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["legal-settlements", caseId] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Settlement Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Enter payment amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any notes about this payment..."
            />
          </div>
          <div className="space-y-2">
            <Label>Upload Receipt</Label>
            <ReceiptUpload onUploadComplete={handleUploadComplete} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
