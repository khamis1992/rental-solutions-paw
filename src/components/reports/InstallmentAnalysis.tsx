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
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentInstallmentCard } from "./installment/CurrentInstallmentCard";

export const InstallmentAnalysis = () => {
  const { toast } = useToast();

  const { data: installmentData, isLoading } = useQuery({
    queryKey: ["installment-analysis"],
    queryFn: async () => {
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment_history")
        .select(`
          *,
          lease:leases (
            customer_id,
            agreement_type,
            total_amount,
            monthly_payment
          )
        `)
        .eq("lease.agreement_type", "lease_to_own")
        .order("created_at");

      if (paymentError) throw paymentError;

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("installment_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (analyticsError) throw analyticsError;

      return {
        payments: paymentData,
        analytics: analyticsData?.[0]
      };
    },
  });

  const exportData = (data: any, filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map((row: any) => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
  };

  const performanceData = installmentData?.payments?.reduce((acc: any, payment) => {
    const month = new Date(payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = {
        month,
        onTime: 0,
        late: 0,
        defaulted: 0,
        earlyPayment: 0,
        totalAmount: 0,
      };
    }

    acc[month].totalAmount += Number(payment.amount_paid || 0);

    if (payment.early_payment_discount > 0) {
      acc[month].earlyPayment++;
    } else if (payment.late_fee_applied > 0) {
      acc[month].late++;
    } else if (payment.status === 'completed') {
      acc[month].onTime++;
    } else {
      acc[month].defaulted++;
    }

    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const insights = installmentData?.analytics?.insights;
  const recommendations = installmentData?.analytics?.recommendations || [];

  return (
    <div className="grid gap-6">
      <CurrentInstallmentCard />

      {insights && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Analysis Insights</AlertTitle>
          <AlertDescription>{insights}</AlertDescription>
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Installment Performance Trends</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData(Object.values(performanceData || {}), "installment-performance")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.values(performanceData || {})}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="onTime" name="On Time Payments" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late Payments" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="defaulted" name="Defaulted" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="earlyPayment" name="Early Payments" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Payment Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.values(performanceData || {})}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAmount" 
                  name="Total Payments"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};