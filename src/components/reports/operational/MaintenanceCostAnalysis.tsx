import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const MaintenanceCostAnalysis = () => {
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ["maintenance-cost-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            make,
            model
          ),
          maintenance_categories (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process data for visualization
      const processedData = data.reduce((acc: any[], record: any) => {
        const category = record.maintenance_categories?.name || "Uncategorized";
        const existingCategory = acc.find(item => item.category === category);
        
        if (existingCategory) {
          existingCategory.cost += record.cost || 0;
          existingCategory.count += 1;
        } else {
          acc.push({
            category,
            cost: record.cost || 0,
            count: 1,
            avgCost: record.cost || 0
          });
        }
        
        return acc;
      }, []);

      // Calculate averages
      processedData.forEach(item => {
        item.avgCost = item.cost / item.count;
      });

      return processedData;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar yAxisId="left" dataKey="cost" name="Total Cost" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="avgCost" name="Average Cost" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};