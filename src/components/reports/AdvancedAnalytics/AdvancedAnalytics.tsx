import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AdvancedAnalytics = () => {
  const [realtimeData, setRealtimeData] = useState<any>(null);

  // Fetch predictive maintenance data
  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["predictive-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictive_maintenance_analytics")
        .select(`
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('predicted_maintenance_date');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch revenue forecasts with year-over-year comparison
  const { data: revenueForecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ["revenue-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .order('forecast_date');
      
      if (error) throw error;
      
      // Calculate year-over-year growth
      return data?.map((forecast, index) => ({
        ...forecast,
        yoy_growth: index > 11 ? 
          ((forecast.predicted_revenue - data[index - 12]?.predicted_revenue) / data[index - 12]?.predicted_revenue) * 100 
          : 0
      }));
    }
  });

  // Fetch vehicle utilization metrics
  const { data: utilizationMetrics, isLoading: isLoadingUtilization } = useQuery({
    queryKey: ["vehicle-utilization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_utilization_metrics")
        .select(`
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('timestamp');
      
      if (error) throw error;
      return data;
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'predictive_maintenance_analytics' 
        },
        (payload) => {
          setRealtimeData(payload.new);
          toast.info("Analytics data updated in real-time");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const data = {
        maintenance: maintenanceData,
        revenue: revenueForecasts,
        utilization: utilizationMetrics
      };

      if (format === 'csv') {
        const csvContent = Object.entries(data).map(([key, value]) => {
          const headers = value ? Object.keys(value[0]).join(',') : '';
          const rows = value ? value.map(row => Object.values(row).join(',')).join('\n') : '';
          return `${key}\n${headers}\n${rows}\n\n`;
        }).join('');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics_export_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // For PDF export, you would typically use a library like pdfmake
        // This is a placeholder for PDF export functionality
        toast.info("PDF export coming soon!");
      }
    } catch (error: any) {
      toast.error("Error exporting data: " + error.message);
    }
  };

  if (isLoadingMaintenance || isLoadingForecasts || isLoadingUtilization) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2 mb-4">
        <Button 
          variant="outline" 
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Predictive Maintenance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="predicted_maintenance_date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value, name) => {
                    if (name === "Predicted Cost") return formatCurrency(value as number);
                    if (name === "Confidence") return `${value}%`;
                    return value;
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="predicted_cost"
                  name="Predicted Cost"
                  stroke="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="confidence_score"
                  name="Confidence"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast Chart with YoY Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast (Year-over-Year)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueForecasts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="forecast_date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value.toFixed(2)}%`}
                />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value, name) => {
                    if (name === "Predicted Revenue") return formatCurrency(value as number);
                    if (name === "YoY Growth") return `${(value as number).toFixed(2)}%`;
                    return value;
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="predicted_revenue" 
                  fill="#8884d8" 
                  name="Predicted Revenue" 
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="yoy_growth"
                  stroke="#82ca9d"
                  name="YoY Growth"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle ROI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle ROI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vehicle.license_plate"
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Revenue" || name === "Costs") return formatCurrency(value as number);
                    if (name === "ROI") return `${value}%`;
                    return value;
                  }}
                />
                <Bar yAxisId="left" dataKey="revenue_generated" name="Revenue" fill="#82ca9d" />
                <Bar yAxisId="left" dataKey="operating_costs" name="Costs" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="roi_percentage" name="ROI" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};