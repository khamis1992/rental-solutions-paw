import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Loader2 } from "lucide-react";

export const FleetAnalytics = () => {
  const { data: fleetData, isLoading } = useQuery({
    queryKey: ["fleet-analytics"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          leases (
            id,
            total_amount,
            agreement_type,
            start_date,
            end_date
          ),
          maintenance (
            cost,
            service_type
          )
        `);

      if (error) throw error;
      return vehicles;
    },
  });

  // Calculate fleet utilization
  const calculateUtilization = (vehicle: any) => {
    if (!vehicle.leases) return 0;
    const totalDays = vehicle.leases.reduce((acc: number, lease: any) => {
      const start = new Date(lease.start_date);
      const end = new Date(lease.end_date);
      return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    return (totalDays / 365) * 100;
  };

  // Calculate maintenance costs
  const calculateMaintenanceCosts = (vehicle: any) => {
    if (!vehicle.maintenance) return 0;
    return vehicle.maintenance.reduce((acc: number, record: any) => acc + (record.cost || 0), 0);
  };

  // Calculate revenue per vehicle
  const calculateRevenue = (vehicle: any) => {
    if (!vehicle.leases) return 0;
    return vehicle.leases.reduce((acc: number, lease: any) => acc + lease.total_amount, 0);
  };

  const utilizationData = fleetData?.map((vehicle) => ({
    name: `${vehicle.make} ${vehicle.model}`,
    utilization: calculateUtilization(vehicle),
    revenue: calculateRevenue(vehicle),
    maintenance: calculateMaintenanceCosts(vehicle),
  }));

  const vehicleTypes = fleetData?.reduce((acc: any, vehicle) => {
    const type = `${vehicle.make} ${vehicle.model}`;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(vehicleTypes || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue per Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="maintenance" fill="#ff8042" name="Maintenance Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};