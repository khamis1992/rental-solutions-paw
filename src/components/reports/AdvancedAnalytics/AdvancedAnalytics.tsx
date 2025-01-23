import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, HeatMapSeries, HeatMap } from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const AdvancedAnalytics = () => {
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

  // Fetch revenue forecasts
  const { data: revenueForecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ["revenue-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .order('forecast_date');
      
      if (error) throw error;
      return data;
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

  if (isLoadingMaintenance || isLoadingForecasts || isLoadingUtilization) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Revenue Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
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
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="predicted_revenue" fill="#8884d8" name="Predicted Revenue" />
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