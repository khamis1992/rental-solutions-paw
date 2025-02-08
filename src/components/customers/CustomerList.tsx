
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
import { CustomerCard } from "./CustomerCard";
import { useCustomers } from "./hooks/useCustomers";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Customer } from "./types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const isMobile = useIsMobile();

  const { data, isLoading, error, refetch } = useCustomers({
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

  if (error) {
    return (
      <Card className="mx-auto">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg mt-4">
            <p className="font-medium">Error loading customers</p>
            <p className="text-sm text-red-400">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mx-auto">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="mt-4">
            {isMobile ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border bg-card">
                <Table>
                  <CustomerTableHeader />
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
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
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredCustomers?.length) {
    return (
      <Card className="mx-auto">
        <CardContent className="pt-6">
          <CustomerFilters 
            onSearchChange={setSearchQuery}
            onRoleFilter={setRoleFilter}
          />
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-600">No customers found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerFilters 
          onSearchChange={setSearchQuery}
          onRoleFilter={setRoleFilter}
        />
        
        {isMobile ? (
          <div className="mt-4 space-y-4">
            {filteredCustomers.map((customer: Customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => {
                  setSelectedCustomerId(customer.id);
                  setShowDetailsDialog(true);
                }}
                onDeleted={refetch}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border bg-card mt-4 overflow-hidden">
            <Table>
              <CustomerTableHeader />
              <TableBody>
                {filteredCustomers.map((customer: Customer) => (
                  <CustomerTableRow 
                    key={customer.id}
                    customer={customer}
                    onDeleted={refetch}
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setShowDetailsDialog(true);
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className={cn(
          "flex justify-center mt-6",
          isMobile && "fixed bottom-4 left-0 right-0 px-4 z-10"
        )}>
          {isMobile ? (
            <Card className="w-full p-4 shadow-lg">
              <VehicleTablePagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page - 1)}
              />
            </Card>
          ) : (
            <VehicleTablePagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
            />
          )}
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
