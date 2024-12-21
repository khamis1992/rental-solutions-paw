import { Car, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const AccidentStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["accident-stats"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status")
        .in("status", ["accident"]);

      if (error) {
        console.error("Error fetching accident stats:", error);
        throw error;
      }

      const needsEvacuation = vehicles?.filter(v => v.status === "accident").length || 0;
      const evacuated = 6; // This would come from your database in a real implementation

      return {
        totalAccidents: vehicles?.length || 0,
        needsEvacuation,
        evacuated,
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Accidents</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats?.totalAccidents || 0}</span>
            <span className="ml-2 text-sm text-gray-500">Vehicles</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-red-500">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>{stats?.needsEvacuation || 0}</span>
              </div>
              <span className="text-gray-600">Evacuation Needed</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <Car className="mr-2 h-4 w-4" />
                <span>{stats?.evacuated || 0}</span>
              </div>
              <span className="text-gray-600">Evacuated</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};