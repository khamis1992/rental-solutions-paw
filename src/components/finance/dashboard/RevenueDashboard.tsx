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

  const monthlyRevenue = payments?.reduce((acc: any, payment) => {
    const date = new Date(payment.payment_date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        shortTerm: 0,
        leaseToOwn: 0,
        total: 0,
      };
    }

    const amount = payment.amount_paid || 0;
    acc[monthYear].total += amount;

    if (payment.lease?.agreement_type === 'short_term') {
      acc[monthYear].shortTerm += amount;
    } else {
      acc[monthYear].leaseToOwn += amount;
    }

    return acc;
  }, {});

  const revenueData = Object.values(monthlyRevenue || {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <LineChart width={600} height={300} data={revenueData}>
            <XAxis dataKey="month" />
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