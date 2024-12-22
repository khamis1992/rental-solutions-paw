import { TableCell, TableRow } from "@/components/ui/table";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Customer } from "../types/customer";

interface CustomerTableRowProps {
  customer: Customer;
  onCustomerClick: (customerId: string) => void;
}

export const CustomerTableRow = ({ customer, onCustomerClick }: CustomerTableRowProps) => {
  const queryClient = useQueryClient();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customer.id);

      if (error) {
        console.error("Error deleting customer:", error);
        throw error;
      }

      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (error: any) {
      console.error("Failed to delete customer:", error);
      toast.error(error.message || "Failed to delete customer");
    }
  };

  return (
    <TableRow key={customer.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="link"
            className="p-0 h-auto font-normal hover:text-primary"
            onClick={() => onCustomerClick(customer.id)}
          >
            {customer.full_name || 'Unnamed User'}
          </Button>
          <Badge variant={getRoleBadgeVariant(customer.role)}>
            {customer.role}
          </Badge>
        </div>
      </TableCell>
      <TableCell>{customer.phone_number || 'N/A'}</TableCell>
      <TableCell>{customer.address || 'N/A'}</TableCell>
      <TableCell>{customer.driver_license || 'N/A'}</TableCell>
      <TableCell className="flex gap-2">
        {customer.id_document_url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <FileText 
                className="h-4 w-4 text-green-500" 
                aria-label="ID Document"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>ID Document Available</p>
            </TooltipContent>
          </Tooltip>
        )}

        {customer.license_document_url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <FileText 
                className="h-4 w-4 text-blue-500" 
                aria-label="License Document"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>License Document Available</p>
            </TooltipContent>
          </Tooltip>
        )}

        {customer.contract_document_url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <FileText 
                className="h-4 w-4 text-orange-500" 
                aria-label="Contract Document"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Contract Document Available</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TableCell>
      <TableCell>
        {new Date(customer.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};