import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Car } from "lucide-react";

interface TrafficFinesSummaryProps {
  customerId: string;
}

export const TrafficFinesSummary = ({ customerId }: TrafficFinesSummaryProps) => {
  const { data: fines, isLoading } = useQuery({
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

  if (isLoading) return <div>Loading traffic fines...</div>;

  const totalFines = fines?.reduce((sum, fine) => sum + fine.fine_amount, 0) || 0;
  const unpaidFines = fines?.filter((fine) => fine.payment_status === "pending") || [];
  const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + fine.fine_amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Traffic Fines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Total Fines</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalFines)}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Unpaid Fines</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalUnpaid)}</div>
            </div>
          </div>

          <div className="space-y-4">
            {fines?.map((fine) => (
              <div key={fine.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">
                    {fine.lease.vehicle.year} {fine.lease.vehicle.make} {fine.lease.vehicle.model}
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
                  <div>{formatCurrency(fine.fine_amount)}</div>
                  <Badge
                    variant="secondary"
                    className={
                      fine.payment_status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }
                  >
                    {fine.payment_status === "completed" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
            {(!fines || fines.length === 0) && (
              <div className="text-center text-muted-foreground">
                No traffic fines recorded
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};