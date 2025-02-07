
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  UserCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />;
      case 'pending_review':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDot = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending_review':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <TableRow 
        className="hover:bg-muted/50 cursor-pointer transition-colors text-sm group"
        onClick={onClick}
      >
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center",
              "group-hover:scale-105 transition-transform"
            )}>
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-medium">{customer.full_name}</div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusDot(customer.status)
                )} />
              </div>
              <div className="text-xs text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {customer.phone_number}
          </div>
        </TableCell>
        <TableCell className="max-w-[200px] truncate py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {customer.address}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            {customer.driver_license}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex gap-2">
            <TooltipProvider>
              {customer.id_document_url ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <FileCheck className="h-3 w-3 mr-1" />
                      ID
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>ID Document Available</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      ID
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>ID Document Missing</TooltipContent>
                </Tooltip>
              )}

              {customer.license_document_url ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileCheck className="h-3 w-3 mr-1" />
                      License
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>License Document Available</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      License
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>License Document Missing</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <Badge 
            variant="outline" 
            className={cn(
              "flex w-fit items-center gap-1 capitalize transition-colors",
              getStatusColor(customer.status)
            )}
          >
            {getStatusIcon(customer.status)}
            {customer.status?.replace('_', ' ') || 'N/A'}
          </Badge>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    disabled={isDeleting}
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Customer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

