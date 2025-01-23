import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ServiceLevel {
  category: string;
  target: number;
  actual: number;
  unit: string;
}

export const ServiceLevelTracking = () => {
  const { data: serviceMetrics, isLoading } = useQuery({
    queryKey: ["service-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_kpis")
        .select("*")
        .eq("category", "service_level")
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
        <CardTitle>Service Level Agreement Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {serviceMetrics?.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{metric.name}</span>
                <span className="text-sm text-muted-foreground">
                  {metric.current_value}{metric.unit} / {metric.target_value}{metric.unit}
                </span>
              </div>
              <Progress 
                value={(metric.current_value / metric.target_value) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};