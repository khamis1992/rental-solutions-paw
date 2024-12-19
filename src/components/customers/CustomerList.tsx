import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { useState } from "react";
import { CustomerFilters } from "./CustomerFilters";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";

const ITEMS_PER_PAGE = 10;

interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  driver_license: string;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
}

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      console.log("Fetching customers with search:", searchQuery);
      let query = supabase
        .from("profiles")
        .select("*")
        .eq('role', 'customer');

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,driver_license.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log("Fetched customers:", data);
      return data;
    },
  });

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
          onStatusChange={setStatusFilter}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Driver License</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
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
          onStatusChange={setStatusFilter}
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
        onStatusChange={setStatusFilter}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Driver License</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <button
                    onClick={() => handleCustomerClick(customer.id)}
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