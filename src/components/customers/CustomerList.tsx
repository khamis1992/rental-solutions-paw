
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerCard } from "./CustomerCard";
import { CustomerFilters } from "./CustomerFilters";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { useCustomers } from "./hooks/useCustomers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading, error, refetch } = useCustomers({
    searchQuery,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const customers = data?.customers || [];
  const totalCount = data?.totalCount || 0;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-[200px] bg-gray-100 rounded-lg"></div>
              </div>
            ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => {
                setSelectedCustomerId(customer.id);
                setShowDetailsDialog(true);
              }}
            />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <div className="text-sm text-gray-500 mb-4">
            Showing {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount}
          </div>
        </div>

        <div className="flex justify-center mt-6">
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
