import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransactionDialogProps {
  transaction: any; // Replace with the actual type
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDialog = ({ transaction, open, onOpenChange }: TransactionDialogProps) => {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setStatus(transaction.status);
      setDescription(transaction.description || '');
    }
  }, [transaction]);

  const handleStatusChange = (newStatus: 'pending' | 'completed' | 'failed') => {
    setStatus(newStatus);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status, description })
        .eq('id', transaction.id);

      if (error) throw error;

      toast.success("Transaction updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as 'pending' | 'completed' | 'failed')}
              className="mt-1 block w-full"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="default" onClick={handleSave} className="ml-2">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
