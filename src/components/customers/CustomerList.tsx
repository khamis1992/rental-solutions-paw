import { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFilters } from "./CustomerFilters";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { CustomerTableHeader } from "./table/CustomerTableHeader";
import { CustomerTableRow } from "./table/CustomerTableRow";
import { useCustomers } from "./hooks/useCustomers";

const ITEMS_PER_PAGE = 10;

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: customers = [], isLoading, error } = useCustomers(searchQuery);

  const totalPages = Math.ceil((customers?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCustomers = customers?.slice(startIndex, endIndex) || [];

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowDetailsDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CustomerFilters 
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
        />
        <div className="rounded-md border">
          <Table>
            <CustomerTableHeader />
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><Skeleton className="h-4 w-[200px]" /></td>
                  <td><Skeleton className="h-4 w-[120px]" /></td>
                  <td><Skeleton className="h-4 w-[250px]" /></td>
                  <td><Skeleton className="h-4 w-[100px]" /></td>
                  <td><Skeleton className="h-4 w-[100px]" /></td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!customers?.length) {
    return (
      <div className="space-y-4">
        <CustomerFilters 
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
        />
        <div className="text-center py-8 text-muted-foreground">
          No customers found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CustomerFilters 
        onSearchChange={setSearchQuery}
        onRoleChange={setRoleFilter}
      />
      <div className="rounded-md border">
        <Table>
          <CustomerTableHeader />
          <TableBody>
            {currentCustomers.map((customer) => (
              <CustomerTableRow 
                key={customer.id}
                customer={{
                  ...customer,
                  address: 'N/A',
                  contract_document_url: null,
                  created_at: new Date().toISOString(),
                }}
                onCustomerClick={handleCustomerClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <VehicleTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedCustomerId && (
        <CustomerDetailsDialog
          customerId={selectedCustomerId}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  );
};