import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BulkPaymentFormProps {
  contractId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function BulkPaymentForm({ contractId, onSuccess, onClose }: BulkPaymentFormProps) {
  const [firstChequeNumber, setFirstChequeNumber] = useState("");
  const [totalCheques, setTotalCheques] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [draweeBankName, setDraweeBankName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!firstChequeNumber || !totalCheques || !amount || !startDate || !draweeBankName) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Creating bulk payments with data:", {
        contractId,
        firstChequeNumber,
        totalCheques,
        amount,
        startDate,
        draweeBankName
      });

      const { data, error } = await supabase.functions.invoke('create-bulk-payments', {
        body: {
          contractId,
          firstChequeNumber,
          totalCheques: parseInt(totalCheques),
          amount: parseFloat(amount),
          startDate,
          draweeBankName
        }
      });

      if (error) throw error;

      console.log("Successfully created bulk payments:", data);
      toast.success(`Successfully created ${totalCheques} payment installments`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating bulk payments:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstChequeNumber">First Cheque Number</Label>
        <Input
          id="firstChequeNumber"
          value={firstChequeNumber}
          onChange={(e) => setFirstChequeNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCheques">Total Number of Cheques</Label>
        <Input
          id="totalCheques"
          type="number"
          min="1"
          value={totalCheques}
          onChange={(e) => setTotalCheques(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount per Cheque (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">First Payment Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
        <Input
          id="draweeBankName"
          value={draweeBankName}
          onChange={(e) => setDraweeBankName(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Payments...
          </>
        ) : (
          'Create Bulk Payments'
        )}
      </Button>
    </form>
  );
}