import { TableCell, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Customer } from "../types/customer";

interface CustomerTableRowProps {
  customer: Customer;
  onCustomerClick: (customerId: string) => void;
}

export const CustomerTableRow = ({ customer, onCustomerClick }: CustomerTableRowProps) => {
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
        <TooltipProvider>
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
        </TooltipProvider>

        <TooltipProvider>
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
        </TooltipProvider>

        <TooltipProvider>
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
        </TooltipProvider>
      </TableCell>
      <TableCell>
        {new Date(customer.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};