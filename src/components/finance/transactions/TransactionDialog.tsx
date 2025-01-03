import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransactionFormData, TransactionType } from "../types/transaction.types";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionDialog = ({ isOpen, onClose, onSuccess }: TransactionDialogProps) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    category_id: "",
    description: "",
    type: TransactionType.INCOME,
    transaction_date: new Date().toISOString(),
    payment_method: "Invoice"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("accounting_transactions")
        .insert({
          ...formData,
          amount: formData.amount.toString(),
          transaction_date: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Transaction added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (QAR)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Input
              id="payment_method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              required
            />
          </div>
          <Button type="submit" className="w-full">Add Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};