import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const TrendAnalysis = () => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['legal-trends'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('legal_cases')
        .select(`
          created_at,
          status,
          amount_owed,
          case_type,
          legal_settlements (
            total_amount,
            paid_amount
          )
        `)
        .order('created_at');

      if (error) throw error;

      // Process data by month
      const monthlyData = cases.reduce((acc: Record<string, any>, curr) => {
        const month = new Date(curr.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!acc[month]) {
          acc[month] = {
            month,
            totalCases: 0,
            resolvedCases: 0,
            totalAmount: 0,
            recoveredAmount: 0,
            settlementRate: 0
          };
        }
        
        acc[month].totalCases++;
        if (curr.status === 'resolved') {
          acc[month].resolvedCases++;
        }
        
        acc[month].totalAmount += Number(curr.amount_owed || 0);
        acc[month].recoveredAmount += curr.legal_settlements?.[0]?.paid_amount || 0;
        acc[month].settlementRate = (acc[month].resolvedCases / acc[month].totalCases) * 100;
        
        return acc;
      }, {});

      return Object.values(monthlyData);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[300px]">
            <p className="text-sm font-medium mb-2">Case Resolution Rate</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Settlement Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="settlementRate" 
                  stroke="#8884d8" 
                  name="Settlement Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <p className="text-sm font-medium mb-2">Amount Recovery Trends</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stroke="#82ca9d" 
                  name="Total Amount"
                />
                <Line 
                  type="monotone" 
                  dataKey="recoveredAmount" 
                  stroke="#8884d8" 
                  name="Recovered Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};