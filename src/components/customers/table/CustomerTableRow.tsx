import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, UserCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface CustomerTableRowProps {
  customer: Customer;
  onDeleted: () => void;
  onClick?: () => void;
}

export const CustomerTableRow = ({ customer, onDeleted, onClick }: CustomerTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast.success("Customer deleted successfully");
      onDeleted();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <TableRow 
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div>{customer.full_name}</div>
              <div className="text-sm text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>{customer.phone_number}</TableCell>
        <TableCell className="max-w-[250px] truncate">{customer.address}</TableCell>
        <TableCell>{customer.driver_license}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            {customer.id_document_url && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                ID
              </Badge>
            )}
            {customer.license_document_url && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                License
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge 
            variant="outline" 
            className={getStatusColor(customer.status)}
          >
            {customer.status?.replace('_', ' ') || 'N/A'}
          </Badge>
        </TableCell>
        <TableCell>
          {customer.created_at && format(new Date(customer.created_at), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
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