import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useBulkPayments } from "../hooks/useBulkPayments";

interface BulkPaymentFormProps {
  contractId: string;
  onSuccess: () => void;
}

export function BulkPaymentForm({ contractId, onSuccess }: BulkPaymentFormProps) {
  const [firstChequeNumber, setFirstChequeNumber] = useState("");
  const [totalCheques, setTotalCheques] = useState<number>(1);
  const [amount, setAmount] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [draweeBankName, setDraweeBankName] = useState("");

  const { isSubmitting, submitBulkPayments } = useBulkPayments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitBulkPayments({
        firstChequeNumber,
        totalCheques,
        amount,
        startDate,
        draweeBankName,
        contractId
      });
      onSuccess();
    } catch (error) {
      // Error is handled in useBulkPayments
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
          onChange={(e) => setTotalCheques(parseInt(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount per Installment (QAR)</Label>
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Payments..." : "Create Bulk Payments"}
      </Button>
    </form>
  );
}