import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

interface TrafficFineListProps {
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

export function TrafficFinesList({ searchQuery, statusFilter, sortField, sortDirection, onSort }: TrafficFineListProps) {
  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines", searchQuery, statusFilter, sortField, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from("traffic_fines")
        .select(`
          *,
          lease:leases(
            customer_id,
            vehicle:vehicles(
              make,
              model,
              year,
              license_plate
            )
          )
        `);

      if (searchQuery) {
        query = query.or(`license_plate.ilike.%${searchQuery}%,violation_number.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter);
      }

      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching traffic fines:", error);
        throw error;
      }

      return data;
    },
  });

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => onSort("violation_date")}
              >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Fine Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines?.map((fine) => (
            <TableRow key={fine.id}>
              <TableCell>
                {fine.lease?.vehicle?.year} {fine.lease?.vehicle?.make}{" "}
                {fine.lease?.vehicle?.model}
                <br />
                <span className="text-sm text-muted-foreground">
                  {fine.lease?.vehicle?.license_plate}
                </span>
              </TableCell>
              <TableCell>{format(new Date(fine.violation_date), "PP")}</TableCell>
              <TableCell>{fine.fine_type}</TableCell>
              <TableCell>{fine.fine_location}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount || 0)}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusBadgeStyle(fine.payment_status)}
                >
                  {fine.payment_status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {(!fines || fines.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No traffic fines found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// Make sure we're exporting the component with both names for backward compatibility
export const TrafficFineTable = TrafficFinesList;