import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export const CustomerList = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("Fetching customers...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq('role', 'customer')
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log("Fetched customers:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
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
          {customers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link
                  to={`/customers/${customer.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {customer.full_name}
                </Link>
              </TableCell>
              <TableCell>{customer.phone_number}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell>{customer.driver_license}</TableCell>
              <TableCell className="flex gap-2">
                {customer.id_document_url && (
                  <FileText className="h-4 w-4 text-green-500" title="ID Document" />
                )}
                {customer.license_document_url && (
                  <FileText className="h-4 w-4 text-blue-500" title="License Document" />
                )}
                {customer.contract_document_url && (
                  <FileText className="h-4 w-4 text-orange-500" title="Contract Document" />
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
  );
};