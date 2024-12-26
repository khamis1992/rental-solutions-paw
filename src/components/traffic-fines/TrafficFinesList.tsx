import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { TrafficFineFilters } from "./TrafficFineFilters";

export function TrafficFinesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          lease:leases(
            id,
            customer:profiles(
              id,
              full_name
            ),
            vehicle:vehicles(
              make,
              model,
              year,
              license_plate
            )
          )
        `)
        .order('violation_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredFines = fines?.filter((fine) => {
    const matchesSearch = searchQuery.toLowerCase() === "" || 
      fine.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.violation_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || fine.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <TrafficFineFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Violation Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fine Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFines?.map((fine) => (
            <TableRow key={fine.id}>
              <TableCell>
                {fine.license_plate}
              </TableCell>
              <TableCell>{fine.violation_number}</TableCell>
              <TableCell>
                {format(new Date(fine.violation_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{fine.fine_type}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
              <TableCell>
                <Badge 
                  variant={fine.payment_status === 'completed' ? 'success' : 'warning'}
                >
                  {fine.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {fine.lease?.customer?.full_name || 'Unassigned'}
              </TableCell>
            </TableRow>
          ))}
          {!filteredFines?.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No traffic fines found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}