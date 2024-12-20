import { TableCell, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Customer } from "../types/customer";

interface CustomerTableRowProps {
  customer: Customer;
  onCustomerClick: (customerId: string) => void;
}

export const CustomerTableRow = ({ customer, onCustomerClick }: CustomerTableRowProps) => {
  return (
    <TableRow key={customer.id}>
      <TableCell>
        <Button
          variant="link"
          className="p-0 h-auto font-normal hover:text-primary"
          onClick={() => onCustomerClick(customer.id)}
        >
          {customer.full_name || 'Unnamed Customer'}
        </Button>
      </TableCell>
      <TableCell>{customer.phone_number || 'N/A'}</TableCell>
      <TableCell>{customer.address || 'N/A'}</TableCell>
      <TableCell>{customer.driver_license || 'N/A'}</TableCell>
      <TableCell className="flex gap-2">
        {customer.id_document_url && (
          <TooltipProvider>
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
          </TooltipProvider>
        )}
        {customer.license_document_url && (
          <TooltipProvider>
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
          </TooltipProvider>
        )}
        {customer.contract_document_url && (
          <TooltipProvider>
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
          </TooltipProvider>
        )}
      </TableCell>
      <TableCell>
        {new Date(customer.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};