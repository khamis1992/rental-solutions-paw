import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SinglePaymentFormProps {
  contractId: string;
  onSuccess: () => void;
}

export function SinglePaymentForm({ contractId, onSuccess }: SinglePaymentFormProps) {
  const [chequeNumber, setChequeNumber] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState("");
  const [draweeBankName, setDraweeBankName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!chequeNumber || !paymentDate || !amount || !draweeBankName) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Submitting payment with data:", {
        contractId,
        chequeNumber,
        amount,
        paymentDate,
        draweeBankName
      });

      const { data, error } = await supabase
        .from("car_installment_payments")
        .insert([{
          contract_id: contractId,
          cheque_number: chequeNumber,
          amount: Number(amount),
          payment_date: paymentDate,
          drawee_bank: draweeBankName,
          paid_amount: Number(amount),
          remaining_amount: 0,
          status: "completed"
        }]);

      if (error) {
        console.error("Error inserting payment:", error);
        throw error;
      }

      console.log("Successfully created payment:", data);
      toast.success("Payment added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chequeNumber">Cheque Number</Label>
        <Input
          id="chequeNumber"
          value={chequeNumber}
          onChange={(e) => setChequeNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (QAR)</Label>
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
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
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
            Adding Payment...
          </>
        ) : (
          'Add Payment'
        )}
      </Button>
    </form>
  );
}