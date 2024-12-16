import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const FinancialReports = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-reports"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payments")
        .select(`
          *,
          lease:leases (
            agreement_type,
            vehicle:vehicles (
              make,
              model
            )
          )
        `)
        .order('created_at');

      if (error) throw error;
      return payments;
    },
  });

  const monthlyRevenue = financialData?.reduce((acc: any, payment) => {
    const date = new Date(payment.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        shortTerm: 0,
        leaseToOwn: 0,
      };
    }

    if (payment.lease?.agreement_type === 'short_term') {
      acc[monthYear].shortTerm += payment.amount;
    } else {
      acc[monthYear].leaseToOwn += payment.amount;
    }

    return acc;
  }, {});

  const revenueData = Object.values(monthlyRevenue || {});

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
          <CardTitle>Revenue by Agreement Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="shortTerm"
                  name="Short Term"
                  stroke="#8884d8"
                />
                <Line
                  type="monotone"
                  dataKey="leaseToOwn"
                  name="Lease to Own"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};