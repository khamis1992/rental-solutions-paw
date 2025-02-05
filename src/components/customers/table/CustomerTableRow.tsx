import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import { format } from "date-fns";
import type { Customer } from "../types/customer";

interface CustomerTableRowProps {
  customer: Customer;
  onDeleted: () => void;
}

export const CustomerTableRow = ({ customer, onDeleted }: CustomerTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First check if customer has any active leases
      const { data: leases, error: leaseCheckError } = await supabase
        .from('leases')
        .select('id, status')
        .eq('customer_id', customer.id);

      if (leaseCheckError) throw leaseCheckError;

      if (leases && leases.length > 0) {
        const activeLeases = leases.filter(lease => 
          ['active', 'pending_payment'].includes(lease.status));

        if (activeLeases.length > 0) {
          toast.error("Cannot delete customer with active leases. Please terminate all leases first.");
          return;
        }

        // Archive leases instead of deleting if they exist but are inactive
        const { error: updateError } = await supabase
          .from('leases')
          .update({ status: 'archived' })
          .eq('customer_id', customer.id);

        if (updateError) throw updateError;
      }

      // Now we can safely delete the customer
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customer.id);

      if (deleteError) throw deleteError;

      toast.success("Customer deleted successfully");
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>{customer.full_name}</TableCell>
        <TableCell>{customer.phone_number}</TableCell>
        <TableCell>{customer.email}</TableCell>
        <TableCell>{customer.address}</TableCell>
        <TableCell>{customer.driver_license}</TableCell>
        <TableCell>
          {customer.id_document_url && (
            <span className="text-sm text-green-600">ID Uploaded</span>
          )}
          {customer.license_document_url && (
            <span className="text-sm text-green-600 ml-2">License Uploaded</span>
          )}
        </TableCell>
        <TableCell>
          {customer.created_at && format(new Date(customer.created_at), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};