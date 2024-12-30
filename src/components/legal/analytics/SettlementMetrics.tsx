import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const SettlementMetrics = () => {
  const { data: settlements, isLoading } = useQuery({
    queryKey: ['settlement-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_settlements')
        .select('created_at, total_amount, paid_amount')
        .order('created_at');

      if (error) throw error;

      return data.map(settlement => ({
        date: new Date(settlement.created_at).toLocaleDateString(),
        totalAmount: Number(settlement.total_amount),
        paidAmount: Number(settlement.paid_amount) || 0
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlement Metrics</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={settlements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="Total Amount" />
              <Line type="monotone" dataKey="paidAmount" stroke="#82ca9d" name="Paid Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};