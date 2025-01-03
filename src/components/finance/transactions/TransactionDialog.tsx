import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionFormData } from "../types/transaction.types";

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionDialog = ({ open, onClose }: TransactionDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    description: "",
    category_id: "",
    payment_method: "Cash",
    transaction_date: new Date().toISOString(),
    type: "INCOME"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("accounting_transactions")
        .insert({
          amount: formData.amount.toString(), // Convert to string for the database
          description: formData.description,
          category_id: formData.category_id,
          payment_method: formData.payment_method,
          transaction_date: formData.transaction_date,
          type: formData.type
        });

      if (error) throw error;

      toast.success("Transaction added successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value as TransactionFormData["payment_method"] })}
            >
              <SelectTrigger>
                <SelectValue />
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
