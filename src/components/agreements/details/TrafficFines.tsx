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
import { format, isValid, parseISO } from "date-fns";

interface TrafficFinesProps {
  agreementId: string;
}

export const TrafficFines = ({ agreementId }: TrafficFinesProps) => {
  const { data: fines, isLoading } = useQuery<TrafficFine[]>({
    queryKey: ["traffic-fines", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          lease:leases(
            id,
            customer_id,
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
        .eq('lease_id', agreementId)
        .order('violation_date', { ascending: false });

      if (error) {
        console.error('Error fetching traffic fines:', error);
        throw error;
      }

      return data as TrafficFine[];
    },
  });

  const getStatusColor = (status: string): string => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.warn(`Invalid date value: ${dateString}`);
        return 'Invalid Date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Traffic Fines</h3>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines?.map((fine) => (
              <TableRow key={fine.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  {formatDate(fine.violation_date)}
                </TableCell>
                <TableCell>{fine.fine_type}</TableCell>
                <TableCell>{fine.fine_location}</TableCell>
                <TableCell className="font-medium">{formatCurrency(fine.fine_amount)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fine.payment_status)}`}>
                    {fine.payment_status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!fines?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No traffic fines recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};