import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettlementPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  settlementId: string;
}

export const SettlementPaymentDialog = ({ open, onClose, settlementId }: SettlementPaymentDialogProps) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error: paymentError } = await supabase
        .from("settlement_payments")
        .insert({
          settlement_id: settlementId,
          amount: Number(amount),
          payment_method: paymentMethod,
          description: description,
          payment_date: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      toast.success("Payment added successfully");
      onClose();
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Settlement Payment</DialogTitle>
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
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value)}
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
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Payment..." : "Add Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};