import { useState } from "react";
import { toast } from "sonner";
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
import { supabase } from "@/integrations/supabase/client";

interface DeleteAgreementDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export const DeleteAgreementDialog = ({
  agreementId,
  open,
  onOpenChange,
  onDeleted,
}: DeleteAgreementDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Delete remaining amounts first
      const { error: remainingAmountsError } = await supabase
        .from('remaining_amounts')
        .delete()
        .eq('lease_id', agreementId);

      if (remainingAmountsError) {
        console.error('Error deleting remaining amounts:', remainingAmountsError);
        throw remainingAmountsError;
      }

      // Delete unified payments
      const { error: paymentsError } = await supabase
        .from('unified_payments')
        .delete()
        .eq('lease_id', agreementId);

      if (paymentsError) {
        console.error('Error deleting payments:', paymentsError);
        throw paymentsError;
      }

      // Delete payment schedules
      const { error: schedulesError } = await supabase
        .from('payment_schedules')
        .delete()
        .eq('lease_id', agreementId);

      if (schedulesError) {
        console.error('Error deleting schedules:', schedulesError);
        throw schedulesError;
      }

      // Delete damages
      const { error: damagesError } = await supabase
        .from('damages')
        .delete()
        .eq('lease_id', agreementId);

      if (damagesError) {
        console.error('Error deleting damages:', damagesError);
        throw damagesError;
      }

      // Delete traffic fines
      const { error: trafficFinesError } = await supabase
        .from('traffic_fines')
        .delete()
        .eq('lease_id', agreementId);

      if (trafficFinesError) {
        console.error('Error deleting traffic fines:', trafficFinesError);
        throw trafficFinesError;
      }

      // Delete agreement documents
      const { error: agreementDocsError } = await supabase
        .from('agreement_documents')
        .delete()
        .eq('lease_id', agreementId);

      if (agreementDocsError) {
        console.error('Error deleting agreement documents:', agreementDocsError);
        throw agreementDocsError;
      }

      // Delete penalties
      const { error: penaltiesError } = await supabase
        .from('penalties')
        .delete()
        .eq('lease_id', agreementId);

      if (penaltiesError) {
        console.error('Error deleting penalties:', penaltiesError);
        throw penaltiesError;
      }

      // Delete security deposits
      const { error: depositsError } = await supabase
        .from('security_deposits')
        .delete()
        .eq('lease_id', agreementId);

      if (depositsError) {
        console.error('Error deleting deposits:', depositsError);
        throw depositsError;
      }

      // Finally delete the agreement
      const { error: agreementError } = await supabase
        .from('leases')
        .delete()
        .eq('id', agreementId);

      if (agreementError) {
        console.error('Error deleting agreement:', agreementError);
        throw agreementError;
      }

      toast.success("Agreement deleted successfully");
      onDeleted?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting agreement:', error);
      toast.error(error.message || "Failed to delete agreement");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the agreement
            and all related data including payments, documents, and records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Agreement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};