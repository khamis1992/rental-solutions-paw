import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDialog = ({ open, onOpenChange }: TransactionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = parseFloat(formData.get('amount') as string);
      const description = formData.get('description') as string;

      const { error } = await supabase
        .from('accounting_transactions')
        .insert({
          amount,
          description,
          transaction_date: new Date().toISOString(),
          type: amount >= 0 ? 'INCOME' : 'EXPENSE'
        });

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
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
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" type="text" required />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};