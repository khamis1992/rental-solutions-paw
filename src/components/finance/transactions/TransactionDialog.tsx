import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionType, TransactionFormData } from "../types/transaction.types";
import { Loader2 } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDialog = ({ open, onOpenChange }: TransactionDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.INCOME,
    amount: 0,
    description: "",
    transaction_date: new Date().toISOString().split('T')[0],
    paymentMethod: "cash"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('accounting_transactions')
        .insert({
          type: formData.type,
          amount: formData.amount,
          description: formData.description,
          transaction_date: formData.transaction_date,
          payment_method: formData.paymentMethod
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <Input
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Transaction'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};