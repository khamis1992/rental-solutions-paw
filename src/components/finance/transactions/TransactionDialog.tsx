import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionType, PaymentMethodType, TransactionFormData } from "@/components/finance/types/transaction.types";

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionDialog = ({ open, onClose }: TransactionDialogProps) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.INCOME,
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value as PaymentMethodType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="transaction_date">Transaction Date</Label>
        <Input
          id="transaction_date"
          type="date"
          name="transaction_date"
          value={formData.transaction_date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={handlePaymentMethodChange} value={formData.paymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="On_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add a description..."
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
};
