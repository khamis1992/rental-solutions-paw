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
} from "recharts";
import { Loader2 } from "lucide-react";

export const CustomerInsights = () => {
  const { data: customerData, isLoading } = useQuery({
    queryKey: ["customer-insights"],
    queryFn: async () => {
      const { data: leases, error } = await supabase
        .from("leases")
        .select(`
          *,
          customer:profiles (
            full_name
          ),
          vehicle:vehicles (
            make,
            model
          )
        `);

      if (error) throw error;
      return leases;
    },
  });

  // Analyze vehicle preferences
  const customerPreferences = customerData?.reduce((acc: any, lease) => {
    const vehicleType = `${lease.vehicle?.make} ${lease.vehicle?.model}`;
    
    if (!acc[vehicleType]) {
      acc[vehicleType] = {
        vehicleType,
        count: 0,
      };
    }
    
    acc[vehicleType].count += 1;
    return acc;
  }, {});

  // Analyze rental duration patterns
  const rentalDurations = customerData?.reduce((acc: any, lease) => {
    const start = new Date(lease.start_date);
    const end = new Date(lease.end_date);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let durationCategory;
    if (duration <= 7) durationCategory = "1 week or less";
    else if (duration <= 30) durationCategory = "1-4 weeks";
    else if (duration <= 90) durationCategory = "1-3 months";
    else durationCategory = "3+ months";

    if (!acc[durationCategory]) {
      acc[durationCategory] = {
        duration: durationCategory,
        count: 0,
      };
    }
    
    acc[durationCategory].count += 1;
    return acc;
  }, {});

  const preferenceData = Object.values(customerPreferences || {});
  const durationData = Object.values(rentalDurations || {});
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
          <CardTitle>Vehicle Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={preferenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicleType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rental Duration Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={durationData}
                  dataKey="count"
                  nameKey="duration"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {durationData.map((entry, index) => (
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
    </div>
  );
};