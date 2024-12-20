import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Car } from "lucide-react";
import { TrafficFine } from "@/types/traffic-fines";

interface TrafficFinesSummaryProps {
  customerId: string;
}

export const TrafficFinesSummary = ({ customerId }: TrafficFinesSummaryProps) => {
  const { data: fines, isLoading } = useQuery<TrafficFine[]>({
    queryKey: ["customer-traffic-fines", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("traffic_fines")
        .select(`
          *,
          lease:leases(
            id,
            customer_id,
            vehicle:vehicles(
              make,
              model,
              year
            )
          )
        `)
        .eq("lease.customer_id", customerId)
        .order("violation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return (
    <Card>
      <CardContent className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </CardContent>
    </Card>
  );

  const totalFines = fines?.reduce((sum, fine) => sum + fine.fine_amount, 0) || 0;
  const unpaidFines = fines?.filter((fine) => fine.payment_status === "pending") || [];
  const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + fine.fine_amount, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Car className="h-5 w-5" />
          Traffic Fines
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card shadow-sm">
              <div className="text-sm text-muted-foreground">Total Fines</div>
              <div className="text-2xl font-semibold text-primary">{formatCurrency(totalFines)}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card shadow-sm">
              <div className="text-sm text-muted-foreground">Unpaid Fines</div>
              <div className="text-2xl font-semibold text-red-600">{formatCurrency(totalUnpaid)}</div>
            </div>
          </div>

          <div className="space-y-4">
            {fines?.map((fine) => (
              <div key={fine.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all">
                <div className="space-y-1">
                  <div className="font-medium text-primary">
                    {fine.lease?.vehicle.year} {fine.lease?.vehicle.make} {fine.lease?.vehicle.model}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(fine.violation_date), "PP")} - {fine.fine_type}
                  </div>
                  {fine.fine_location && (
                    <div className="text-sm text-muted-foreground">
                      Location: {fine.fine_location}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div className="font-medium">{formatCurrency(fine.fine_amount)}</div>
                  <Badge
                    variant="secondary"
                    className={
                      fine.payment_status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }
                  >
                    {fine.payment_status === "completed" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
            {(!fines || fines.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                No traffic fines recorded
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};