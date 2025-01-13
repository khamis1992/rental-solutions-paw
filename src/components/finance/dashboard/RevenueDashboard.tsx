import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const RevenueDashboard = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['unified-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_payments')
        .select(`
          amount,
          amount_paid,
          payment_date,
          lease:leases (
            agreement_type
          )
        `)
        .eq('status', 'completed');

      if (error) throw error;
      return data;
    }
  });

  // Transform the data for the chart
  const chartData = payments?.map(payment => ({
    date: new Date(payment.payment_date).toLocaleDateString(),
    revenue: payment.amount_paid
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <LineChart width={600} height={300} data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        )}
      </CardContent>
    </Card>
  );
};