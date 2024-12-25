import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { TrafficFineTableHeader } from "./table/TrafficFineTableHeader";
import { TrafficFineTableRow } from "./table/TrafficFineTableRow";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

export const TrafficFinesList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["traffic-fines"] });
  }, [queryClient]);

  const { data: fines, isLoading, error } = useQuery({
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
            )
          ),
          vehicle:vehicles(
            id,
            make,
            model,
            license_plate
          )
        `)
        .order('violation_date', { ascending: false });

      if (error) {
        console.error('Error fetching traffic fines:', error);
        throw error;
      }
      
      return data;
    },
  });

  const handleMarkAsPaid = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .update({ payment_status: 'completed' })
        .eq('id', fineId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine marked as paid",
      });
      
      queryClient.invalidateQueries({ queryKey: ["traffic-fines"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update fine status",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading traffic fines: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <Table>
          <TrafficFineTableHeader />
          <TableBody>
            {fines?.map((fine) => (
              <ErrorBoundary key={fine.id}>
                <TrafficFineTableRow
                  fine={fine}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </ErrorBoundary>
            ))}
            {!fines?.length && (
              <tr>
                <td colSpan={11} className="text-center py-8 text-muted-foreground">
                  No traffic fines recorded
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </ErrorBoundary>
  );
};