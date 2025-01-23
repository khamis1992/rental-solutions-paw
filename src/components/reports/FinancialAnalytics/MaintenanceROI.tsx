import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const MaintenanceROI = () => {
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ["maintenance-roi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          id,
          cost,
          vehicle_id,
          service_type,
          completed_date,
          vehicles (
            make,
            model
          )
        `)
        .eq("status", "completed")
        .order("completed_date", { ascending: false });

      if (error) throw error;

      // Calculate ROI based on maintenance costs and vehicle performance
      const roiData = data.map(item => ({
        id: item.id,
        vehicle: `${item.vehicles?.make} ${item.vehicles?.model}`,
        cost: item.cost,
        type: item.service_type,
        date: new Date(item.completed_date).toLocaleDateString(),
        // Simulated ROI calculation - in real app would be based on actual metrics
        savings: item.cost * 1.5 // Example: 50% return on maintenance investment
      }));

      return roiData;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance ROI Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance ROI Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="cost" name="Investment" fill="#ff7c7c" />
              <Bar dataKey="savings" name="Projected Savings" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};