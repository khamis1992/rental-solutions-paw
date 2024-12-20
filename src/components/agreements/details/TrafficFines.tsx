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
import { TrafficFine } from "@/types/traffic-fines";

interface TrafficFinesProps {
  agreementId: string;
}

export const TrafficFines = ({ agreementId }: TrafficFinesProps) => {
  const { data: fines, isLoading } = useQuery<TrafficFine[]>({
    queryKey: ["traffic-fines", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('*')
        .eq('lease_id', agreementId)
        .order('violation_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading fines...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Traffic Fines</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fines?.map((fine) => (
            <TableRow key={fine.id}>
              <TableCell>
                {new Date(fine.violation_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{fine.fine_type}</TableCell>
              <TableCell>{fine.fine_location}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
              <TableCell>{fine.payment_status}</TableCell>
            </TableRow>
          ))}
          {!fines?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No traffic fines recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};