import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export const VehicleUtilizationMetrics = () => {
  const { data: utilizationData } = useQuery({
    queryKey: ["vehicle-utilization"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          year,
          leases (
            start_date,
            end_date,
            total_amount,
            status
          ),
          maintenance (
            id,
            cost,
            scheduled_date,
            completed_date
          )
        `);

      if (error) throw error;

      return vehicles.map((vehicle) => {
        // Calculate total days rented
        const totalDaysRented = vehicle.leases?.reduce((acc, lease) => {
          if (!lease.start_date || !lease.end_date) return acc;
          const start = new Date(lease.start_date);
          const end = new Date(lease.end_date);
          return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) || 0;

        // Calculate revenue
        const totalRevenue = vehicle.leases?.reduce((acc, lease) => {
          return acc + (lease.total_amount || 0);
        }, 0) || 0;

        // Calculate maintenance costs
        const maintenanceCosts = vehicle.maintenance?.reduce((acc, record) => {
          return acc + (record.cost || 0);
        }, 0) || 0;

        // Calculate utilization rate (days rented / 365) * 100
        const utilizationRate = (totalDaysRented / 365) * 100;

        return {
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          utilizationRate: Math.min(100, Number(utilizationRate.toFixed(2))),
          revenue: totalRevenue,
          maintenanceCosts,
          roi: totalRevenue > 0 ? ((totalRevenue - maintenanceCosts) / maintenanceCosts * 100).toFixed(2) : 0
        };
      });
    }
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Fleet Utilization & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") return formatCurrency(value as number);
                  if (name === "maintenanceCosts") return formatCurrency(value as number);
                  if (name === "utilizationRate") return `${value}%`;
                  if (name === "roi") return `${value}%`;
                  return value;
                }}
              />
              <Bar yAxisId="left" dataKey="utilizationRate" name="Utilization Rate %" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
              <Bar yAxisId="right" dataKey="maintenanceCosts" name="Maintenance Costs" fill="#ffc658" />
              <Bar yAxisId="left" dataKey="roi" name="ROI %" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};