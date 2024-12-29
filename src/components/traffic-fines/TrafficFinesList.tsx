import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TrafficFinesListProps {
  searchQuery: string;
  statusFilter: string;
}

export const TrafficFinesList = ({
  searchQuery,
  statusFilter,
}: TrafficFinesListProps) => {
  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines", statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("traffic_fines")
        .select("*")
        .order('created_at', { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("payment_status", statusFilter);
      }

      if (searchQuery) {
        query = query.or(
          `license_plate.ilike.%${searchQuery}%,violation_number.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Violation Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Charge</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines?.map((fine) => (
            <TableRow key={fine.id}>
              <TableCell>{fine.license_plate}</TableCell>
              <TableCell>{fine.violation_number}</TableCell>
              <TableCell>
                {fine.violation_date ? format(new Date(fine.violation_date), "PPP") : "N/A"}
              </TableCell>
              <TableCell>{fine.fine_location}</TableCell>
              <TableCell>{fine.violation_charge}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
              <TableCell>{fine.violation_points}</TableCell>
              <TableCell>
                <Badge 
                  variant={fine.payment_status === "completed" ? "success" : "secondary"}
                >
                  {fine.payment_status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {!fines?.length && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No traffic fines found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};