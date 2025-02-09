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
        className="hover:bg-muted/50 cursor-pointer transition-colors text-sm"
        onClick={onClick}
      >
        <TableCell className="py-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{customer.full_name}</div>
              <div className="text-xs text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-2 text-sm">{customer.phone_number}</TableCell>
        <TableCell className="max-w-[200px] truncate py-2 text-sm">{customer.address}</TableCell>
        <TableCell className="py-2 text-sm">{customer.driver_license}</TableCell>
        <TableCell className="py-2">
          <div className="flex gap-1">
            {customer.id_document_url && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                ID
              </Badge>
            )}
            {customer.license_document_url && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                License
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="py-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(customer.status)}`}
          >
            {customer.status?.replace('_', ' ') || 'N/A'}
          </Badge>
        </TableCell>
        <TableCell className="py-2">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
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