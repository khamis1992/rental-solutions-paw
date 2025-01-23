import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const DynamicPricing = () => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["fleet-optimization-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_optimization_recommendations")
        .select(`
          *,
          vehicle:vehicles (
            make,
            model,
            year
          )
        `)
        .eq("recommendation_type", "pricing")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Pricing Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Pricing Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">
                  {rec.vehicle?.year} {rec.vehicle?.make} {rec.vehicle?.model}
                </h3>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={rec.priority === "high" ? "destructive" : "secondary"}
                  className="mb-2"
                >
                  {rec.priority} priority
                </Badge>
                <div className="flex items-center gap-2">
                  {Number(rec.estimated_impact) > 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    {formatCurrency(Math.abs(Number(rec.estimated_impact)))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};