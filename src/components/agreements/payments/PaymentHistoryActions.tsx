import { Button } from "@/components/ui/button";
import { PaymentImport } from "../PaymentImport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentHistoryActionsProps {
  agreementId?: string;
  paymentCount: number;
}

export function PaymentHistoryActions({ agreementId, paymentCount }: PaymentHistoryActionsProps) {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllPayments = async () => {
    setIsDeleting(true);
    try {
      let query = supabase.from("payments").delete();
      
      if (agreementId) {
        query = query.eq("lease_id", agreementId);
      } else {
        // Add a condition that will match all records
        query = query.gte("created_at", '1970-01-01');
      }

      const { error } = await query;

      if (error) throw error;

      toast.success("All payments have been deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["payment-history", agreementId] });
    } catch (error) {
      console.error("Error deleting payments:", error);
      toast.error("Failed to delete payments");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <PaymentImport />
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting || !paymentCount}
        >
          Delete All Payments
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {agreementId ? "all payments for this agreement" : "all payments in the system"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllPayments}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}