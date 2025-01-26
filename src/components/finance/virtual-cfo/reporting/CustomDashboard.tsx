import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from "recharts";
import { FileDown, FileText, FileSpreadsheet, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface MetricConfig {
  id: string;
  type: "bar" | "line";
  title: string;
  dataKey: string;
}

export const CustomDashboard = () => {
  const [selectedMetrics] = useState<MetricConfig[]>([
    { id: "revenue", type: "line", title: "Revenue Trend", dataKey: "revenue" },
    { id: "expenses", type: "bar", title: "Expense Categories", dataKey: "amount" }
  ]);

  const { data: financialData } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select(`
          amount,
          type,
          transaction_date,
          category:accounting_categories(name)
        `)
        .order('transaction_date');

      if (error) throw error;
      return data;
    }
  });

  const exportData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Simulate export - in production, implement actual export logic
      toast.success(`Exporting dashboard as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export dashboard");
    }
  };

  const renderChart = (metric: MetricConfig) => {
    if (!financialData) return null;

    const ChartComponent = metric.type === 'bar' ? BarChart : LineChart;
    const DataComponent = metric.type === 'bar' ? Bar : Line;

    return (
      <Card key={metric.id} className="col-span-1">
        <CardHeader>
          <CardTitle>{metric.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={financialData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="transaction_date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <DataComponent 
                  type="monotone" 
                  dataKey={metric.dataKey}
                  fill="#60a5fa"
                  stroke="#60a5fa"
                />
              </ChartComponent>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('excel')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportData('csv')}
          >
            <FileDown className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {selectedMetrics.map(metric => renderChart(metric))}
      </div>
    </div>
  );
};