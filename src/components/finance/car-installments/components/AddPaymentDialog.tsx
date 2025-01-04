import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addMonths, format } from "date-fns";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
  totalInstallments: number;
}

export const AddPaymentDialog = ({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess,
  totalInstallments
}: AddPaymentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstChequeNumber, setFirstChequeNumber] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");

  const generateChequeSequence = (baseNumber: string, startDate: string, amount: number) => {
    const sequence = [];
    const baseDigits = baseNumber.replace(/\D/g, '');
    const basePrefix = baseNumber.replace(/\d/g, '');
    
    for (let i = 0; i < totalInstallments; i++) {
      const nextNumber = String(Number(baseDigits) + i).padStart(baseDigits.length, '0');
      const paymentDate = addMonths(new Date(startDate), i);
      
      sequence.push({
        cheque_number: `${basePrefix}${nextNumber}`,
        payment_date: format(paymentDate, 'yyyy-MM-dd'),
      });
    }
    return sequence;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const amount = Number(formData.get("amount"));
      const draweeBankName = String(formData.get("draweeBankName"));

      if (!firstChequeNumber || !firstPaymentDate) {
        throw new Error("Please enter both cheque number and payment date");
      }

      const chequeSequence = generateChequeSequence(
        firstChequeNumber,
        firstPaymentDate,
        amount
      );

      let successCount = 0;
      let errorCount = 0;

      // Process payments one by one
      for (const cheque of chequeSequence) {
        try {
          // First check if cheque number exists using maybeSingle()
          const { data: existingCheque } = await supabase
            .from("car_installment_payments")
            .select("id")
            .eq("cheque_number", cheque.cheque_number)
            .maybeSingle();

          if (existingCheque) {
            console.warn(`Skipping duplicate cheque number: ${cheque.cheque_number}`);
            errorCount++;
            continue;
          }

          // Insert new payment
          const { error: insertError } = await supabase
            .from("car_installment_payments")
            .insert({
              contract_id: contractId,
              cheque_number: cheque.cheque_number,
              amount: amount,
              payment_date: cheque.payment_date,
              drawee_bank: draweeBankName,
              paid_amount: 0,
              remaining_amount: amount,
              status: "pending"
            });

          if (insertError) {
            console.error("Error inserting payment:", insertError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error("Error processing cheque:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} payment installments`);
        if (errorCount > 0) {
          toast.warning(`${errorCount} installments could not be added (duplicate cheque numbers)`);
        }
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to add any payment installments");
      }
    } catch (error: any) {
      console.error("Error adding payments:", error);
      toast.error(error.message || "Failed to add payment installments");
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
            <Label htmlFor="chequeNumber">First Cheque Number</Label>
            <Input 
              id="chequeNumber" 
              name="chequeNumber" 
              value={firstChequeNumber}
              onChange={(e) => setFirstChequeNumber(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount per Installment (QAR)</Label>
            <Input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">First Payment Date</Label>
            <Input 
              id="paymentDate" 
              name="paymentDate" 
              type="date"
              value={firstPaymentDate}
              onChange={(e) => setFirstPaymentDate(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
            <Input id="draweeBankName" name="draweeBankName" required />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding Payments..." : "Add Payment Sequence"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};