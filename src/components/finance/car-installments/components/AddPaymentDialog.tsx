import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
}

export const AddPaymentDialog = ({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess 
}: AddPaymentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const amount = Number(formData.get("amount"));
      const paidAmount = Number(formData.get("paidAmount"));

      const paymentData = {
        contract_id: contractId,
        cheque_number: String(formData.get("chequeNumber")),
        amount: amount,
        payment_date: String(formData.get("paymentDate")),
        drawee_bank: String(formData.get("draweeBankName")),
        paid_amount: paidAmount,
        remaining_amount: amount - paidAmount,
        status: "pending"
      };

      const { error } = await supabase
        .from("car_installment_payments")
        .insert(paymentData);

      if (error) throw error;

      toast.success("Payment installment added successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment installment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Installment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chequeNumber">Cheque Number</Label>
            <Input id="chequeNumber" name="chequeNumber" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (QAR)</Label>
            <Input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount (QAR)</Label>
            <Input 
              id="paidAmount" 
              name="paidAmount" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input 
              id="paymentDate" 
              name="paymentDate" 
              type="date" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
            <Input id="draweeBankName" name="draweeBankName" required />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding Payment..." : "Add Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};