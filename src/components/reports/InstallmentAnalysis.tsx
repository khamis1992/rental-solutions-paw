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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const InstallmentAnalysis = () => {
  const { toast } = useToast();

  const { data: installmentData, isLoading } = useQuery({
    queryKey: ["installment-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) throw error;
      return data;
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

  const performanceData = installmentData?.reduce((acc: any, payment) => {
    const month = new Date(payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = {
        month,
        onTime: 0,
        late: 0,
        defaulted: 0,
        earlyPayment: 0,
      };
    }

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

  return (
    <div className="grid gap-6">
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTime" name="On Time Payments" fill="#4ade80" />
                <Bar dataKey="late" name="Late Payments" fill="#fbbf24" />
                <Bar dataKey="defaulted" name="Defaulted" fill="#ef4444" />
                <Bar dataKey="earlyPayment" name="Early Payments" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};