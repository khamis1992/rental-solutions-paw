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
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

interface CustomerData {
  id: string;
  full_name: string | null;
  status: string;
  phone_number: string | null;
  address: string | null;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
}

interface CustomerQueryResult {
  id: string;
  full_name: string | null;
  status: string;
  profiles: {
    phone_number: string | null;
    address: string | null;
    driver_license: string | null;
    id_document_url: string | null;
    license_document_url: string | null;
    contract_document_url: string | null;
    created_at: string;
  };
}

export const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: customers, isLoading } = useQuery<CustomerData[]>({
    queryKey: ["customers", searchQuery],
    queryFn: async () => {
      console.log("Fetching customers with search:", searchQuery);
      let query = supabase
        .from("customer_statuses")
        .select(`
          id,
          full_name,
          status,
          profiles!inner (
            phone_number,
            address,
            driver_license,
            id_document_url,
            license_document_url,
            contract_document_url,
            created_at
          )
        `);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,profiles.phone_number.ilike.%${searchQuery}%,profiles.driver_license.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log("Fetched customers:", data);
      
      // Transform the data to match CustomerData interface
      return (data as CustomerQueryResult[]).map(item => ({
        id: item.id,
        full_name: item.full_name,
        status: item.status,
        phone_number: item.profiles.phone_number,
        address: item.profiles.address,
        driver_license: item.profiles.driver_license,
        id_document_url: item.profiles.id_document_url,
        license_document_url: item.profiles.license_document_url,
        contract_document_url: item.profiles.contract_document_url,
        created_at: item.profiles.created_at
      }));
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
        <CustomerFilters onSearchChange={setSearchQuery} />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (!customers?.length) {
    return (
      <div className="space-y-4">
        <CustomerFilters onSearchChange={setSearchQuery} />
        <div className="text-center py-8 text-muted-foreground">
          No customers found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CustomerFilters onSearchChange={setSearchQuery} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Driver License</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
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
                  <Badge
                    variant={customer.status === 'active' ? 'success' : 'secondary'}
                    className={
                      customer.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }
                  >
                    {customer.status}
                  </Badge>
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