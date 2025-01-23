import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPICard } from "./KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KPIDashboard = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["business-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_kpis")
        .select("*")
        .order("category");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-4" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis?.map((kpi) => (
          <KPICard
            key={kpi.id}
            name={kpi.name}
            currentValue={kpi.current_value}
            targetValue={kpi.target_value}
            unit={kpi.unit}
            category={kpi.category}
          />
        ))}
      </div>
    </div>
  );
};