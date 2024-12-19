import { TableCell, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";

interface CustomerTableRowProps {
  customer: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
    driver_license: string | null;
    id_document_url: string | null;
    license_document_url: string | null;
    contract_document_url: string | null;
    created_at: string;
  };
  onCustomerClick: (customerId: string) => void;
}

export const CustomerTableRow = ({ customer, onCustomerClick }: CustomerTableRowProps) => {
  return (
    <TableRow key={customer.id}>
      <TableCell>
        <button
          onClick={() => onCustomerClick(customer.id)}
          className="text-blue-600 hover:underline"
        >
          {customer.full_name || 'Unnamed Customer'}
        </button>
      </TableCell>
      <TableCell>{customer.phone_number || 'N/A'}</TableCell>
      <TableCell>{customer.address || 'N/A'}</TableCell>
      <TableCell>{customer.driver_license || 'N/A'}</TableCell>
      <TableCell className="flex gap-2">
        {customer.id_document_url && (
          <FileText className="h-4 w-4 text-green-500" aria-label="ID Document" />
        )}
        {customer.license_document_url && (
          <FileText className="h-4 w-4 text-blue-500" aria-label="License Document" />
        )}
        {customer.contract_document_url && (
          <FileText className="h-4 w-4 text-orange-500" aria-label="Contract Document" />
        )}
      </TableCell>
      <TableCell>
        {new Date(customer.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};