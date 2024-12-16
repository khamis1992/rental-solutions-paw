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

  const preferenceData = Object.values(customerPreferences || {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
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
    </div>
  );
};