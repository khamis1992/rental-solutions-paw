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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Customer } from "./types/customer";

const ITEMS_PER_PAGE = 10;

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading, error } = useCustomers({
    searchQuery,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const customers = data?.customers || [];
  const totalCount = data?.totalCount || 0;

  const filteredCustomers = customers.filter(customer => 
    roleFilter === "all" || customer.role === roleFilter
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowDetailsDialog(true);
  };

  if (error) {
    return (
      <Card className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-8 text-red-500">
            Error loading customers. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="rounded-md border bg-card">
            <Table>
              <CustomerTableHeader />
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[250px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredCustomers?.length) {
    return (
      <Card className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-8 text-muted-foreground">
            No customers found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Customer Management</CardTitle>
        </div>
        <CardDescription>
          View and manage customer information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CustomerFilters 
          onSearchChange={setSearchQuery}
          onRoleFilter={setRoleFilter}
        />
        <div className="rounded-md border bg-card">
          <Table>
            <CustomerTableHeader />
            <TableBody>
              {filteredCustomers.map((customer) => (
                <CustomerTableRow 
                  key={customer.id}
                  customer={customer}
                  onCustomerClick={handleCustomerClick}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center mt-4">
          <VehicleTablePagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page - 1)}
          />
        </div>

        {selectedCustomerId && (
          <CustomerDetailsDialog
            customerId={selectedCustomerId}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
        )}
      </CardContent>
    </Card>
  );
};