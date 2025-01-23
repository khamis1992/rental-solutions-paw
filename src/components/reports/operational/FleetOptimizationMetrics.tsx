import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const FleetOptimizationMetrics = () => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["fleet-optimization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_optimization_recommendations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
        <CardTitle>Fleet Optimization Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div key={rec.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{rec.recommendation_type}</h4>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${rec.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
              {rec.estimated_impact && (
                <div className="mt-2 text-sm">
                  Estimated Impact: {formatCurrency(rec.estimated_impact)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};