import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethodType } from "../types/transaction.types";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: TransactionDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("Cash");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      description,
      paymentMethod,
    });
    setAmount("");
    setDescription("");
    setPaymentMethod("Cash");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethodType) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="On_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Add Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};