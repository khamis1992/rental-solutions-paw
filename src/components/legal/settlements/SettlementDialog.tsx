import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SettlementDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettlementDialog = ({
  caseId,
  open,
  onOpenChange,
}: SettlementDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    terms: "",
    totalAmount: "",
    paymentPlan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("legal_settlements").insert({
        case_id: caseId,
        terms: formData.terms,
        total_amount: parseFloat(formData.totalAmount),
        payment_plan: {
          description: formData.paymentPlan,
        },
        status: "pending",
      });

      if (error) throw error;

      toast.success("Settlement agreement created successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-settlements", caseId] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating settlement:", error);
      toast.error("Failed to create settlement agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Settlement Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Settlement Terms</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.value })
              }
              placeholder="Enter settlement terms..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: e.target.value })
              }
              placeholder="Enter total settlement amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentPlan">Payment Plan</Label>
            <Textarea
              id="paymentPlan"
              value={formData.paymentPlan}
              onChange={(e) =>
                setFormData({ ...formData, paymentPlan: e.target.value })
              }
              placeholder="Describe the payment plan..."
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Settlement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};