import { Card, CardContent } from "@/components/ui/card";
import { Car, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity = () => {
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      // Fetch recent vehicle additions
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent agreement updates
      const { data: agreements } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (
            make,
            model
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(5);

      return {
        vehicles,
        agreements
      };
    },
  });

  if (!recentActivities?.vehicles && !recentActivities?.agreements) {
    return (
      <div className="text-center text-gray-500 py-8">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentActivities?.vehicles?.map((vehicle) => (
        <div
          key={vehicle.id}
          className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
        >
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
            <Car className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              New Vehicle Added
            </p>
            <p className="text-sm text-gray-500 truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(vehicle.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}

      {recentActivities?.agreements?.map((agreement) => (
        <div
          key={agreement.id}
          className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
        >
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-50 text-green-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Agreement Updated
            </p>
            <p className="text-sm text-gray-500 truncate">
              {agreement.vehicles?.make} {agreement.vehicles?.model}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(agreement.updated_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
};