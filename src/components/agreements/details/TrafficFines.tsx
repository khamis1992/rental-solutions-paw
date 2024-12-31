import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { TrafficFineStatusBadge } from "./components/TrafficFineStatusBadge";
import { fetchTrafficFines } from "./utils/trafficFineUtils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TrafficFinesProps {
  agreementId: string;
}

export const TrafficFines = ({ agreementId }: TrafficFinesProps) => {
  const queryClient = useQueryClient();
  
  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines", agreementId],
    queryFn: () => fetchTrafficFines(agreementId),
  });

  const handleStatusChange = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .update({ 
          payment_status: 'completed',
          payment_date: new Date().toISOString()
        })
        .eq('id', fineId);

      if (error) throw error;

      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["traffic-fines"] }),
        queryClient.invalidateQueries({ queryKey: ["legal-cases"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-history"] })
      ]);

      toast.success("Traffic fine marked as paid");
    } catch (error) {
      console.error('Error updating traffic fine:', error);
      toast.error("Failed to update traffic fine status");
    }
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

  const totalFines = fines?.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;
  const unpaidFines = fines?.filter(fine => fine.payment_status !== 'completed')
    .reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Traffic Fines</h3>
        <div className="space-x-4">
          <span className="text-sm font-medium">
            Total Fines: {formatCurrency(totalFines)}
          </span>
          <span className="text-sm font-medium text-red-600">
            Unpaid: {formatCurrency(unpaidFines)}
          </span>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines?.map((fine) => (
              <TableRow key={fine.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>{formatDate(fine.violation_date)}</TableCell>
                <TableCell>{fine.fine_type}</TableCell>
                <TableCell>{fine.fine_location}</TableCell>
                <TableCell className="font-medium">{formatCurrency(fine.fine_amount)}</TableCell>
                <TableCell>
                  <TrafficFineStatusBadge status={fine.payment_status} />
                </TableCell>
                <TableCell>
                  {fine.payment_status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(fine.id)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!fines?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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