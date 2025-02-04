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
          amount_paid,
          payment_date,
          lease:leases (
            agreement_type,
            vehicle:vehicles (
              make,
              model
            )
          )
        `)
        .eq('status', 'completed')
        .order('payment_date');

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <LineChart width={600} height={300} data={payments}>
              <XAxis dataKey="payment_date" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="amount_paid" stroke="#8884d8" />
            </LineChart>
          )}
        </CardContent>
      </Card>
    </div>
  );
};