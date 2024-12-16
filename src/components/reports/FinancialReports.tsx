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
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const FinancialReports = () => {
  const { toast } = useToast();

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

  const { data: maintenanceData } = useQuery({
    queryKey: ["maintenance-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .order('created_at');

      if (error) throw error;
      return data;
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
        total: 0,
      };
    }

    const amount = payment.amount || 0;
    acc[monthYear].total += amount;

    if (payment.lease?.agreement_type === 'short_term') {
      acc[monthYear].shortTerm += amount;
    } else {
      acc[monthYear].leaseToOwn += amount;
    }

    return acc;
  }, {});

  const monthlyExpenses = maintenanceData?.reduce((acc: any, record) => {
    const date = new Date(record.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        maintenance: 0,
      };
    }

    acc[monthYear].maintenance += record.cost || 0;
    return acc;
  }, {});

  const revenueData = Object.values(monthlyRevenue || {});
  const expenseData = Object.values(monthlyExpenses || {});

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue by Agreement Type</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData(revenueData, "revenue-by-type")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Revenue"
                  stroke="#ff7300"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Expenses</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData(expenseData, "monthly-expenses")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="maintenance"
                  name="Maintenance Expenses"
                  fill="#ff8042"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};