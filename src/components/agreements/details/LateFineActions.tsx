import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface LateFineActionsProps {
  paymentId: string;
  currentLateFine: number;
  onUpdate: () => void;
}

export const LateFineActions = ({ paymentId, currentLateFine, onUpdate }: LateFineActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newLateFine, setNewLateFine] = useState(currentLateFine.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuth();

  const handleUpdateLateFine = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('unified_payments')
        .update({ 
          late_fine_amount: Number(newLateFine),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Create audit log with user information
      await supabase.from('audit_logs').insert({
        entity_type: 'payment',
        entity_id: paymentId,
        action: 'update_late_fine',
        changes: {
          previous_amount: currentLateFine,
          new_amount: Number(newLateFine)
        },
        performed_by: session?.user?.id
      });

      toast.success("Late fine updated successfully");
      onUpdate();
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating late fine:', error);
      toast.error('Failed to update late fine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLateFine = async () => {
    try {
      const { error } = await supabase
        .from('unified_payments')
        .update({ 
          late_fine_amount: 0,
          days_overdue: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Create audit log with user information
      await supabase.from('audit_logs').insert({
        entity_type: 'payment',
        entity_id: paymentId,
        action: 'delete_late_fine',
        changes: {
          previous_amount: currentLateFine,
          new_amount: 0
        },
        performed_by: session?.user?.id
      });

      toast.success("Late fine removed successfully");
      onUpdate();
    } catch (error) {
      console.error('Error removing late fine:', error);
      toast.error('Failed to remove late fine');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Late Fine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Late Fine: {formatCurrency(currentLateFine)}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newLateFine}
                onChange={(e) => setNewLateFine(e.target.value)}
                placeholder="Enter new late fine amount"
              />
            </div>
            <Button
              onClick={handleUpdateLateFine}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Updating..." : "Update Late Fine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDeleteLateFine}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};