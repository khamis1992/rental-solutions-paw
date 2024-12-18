import { Card, CardContent } from "@/components/ui/card";
import { Car, Wrench, AlertTriangle, Shield, AlertCircle, ShieldAlert, CarTaxiFront } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  status: string;
}

interface VehicleStatsProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

// Map of status to icon and color configuration
const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  police_station: {
    icon: Shield,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/10",
  },
  accident: {
    icon: AlertCircle,
    color: "text-[#dc2626]",
    bgColor: "bg-[#dc2626]/10",
  },
  reserve: {
    icon: CarTaxiFront,
    color: "text-[#059669]",
    bgColor: "bg-[#059669]/10",
  },
  stolen: {
    icon: ShieldAlert,
    color: "text-[#7c3aed]",
    bgColor: "bg-[#7c3aed]/10",
  },
};

export const VehicleStats = ({ vehicles, isLoading }: VehicleStatsProps) => {
  const { data: vehicleCounts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["vehicle-counts"],
    queryFn: async () => {
      console.log("Fetching vehicle counts...");
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      console.log("Retrieved vehicles:", vehicles);

      // Get unique statuses (excluding the main three that are always shown)
      const uniqueStatuses = [...new Set(vehicles.map(v => v.status))]
        .filter(status => !['available', 'maintenance'].includes(status));

      // Count vehicles for each status
      const counts = {
        available: vehicles.filter(v => v.status === 'available').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        needsAttention: vehicles.filter(v => ['accident', 'police_station'].includes(v.status)).length,
      };

      // Add counts for other statuses
      uniqueStatuses.forEach(status => {
        if (status) {
          counts[status] = vehicles.filter(v => v.status === status).length;
        }
      });

      console.log("Calculated counts:", counts);
      return counts;
    },
  });

  const mainStats = [
    {
      title: "Available Vehicles",
      value: vehicleCounts?.available || 0,
      icon: Car,
      color: "text-[#9b87f5]",
      bgColor: "bg-[#9b87f5]/10",
    },
    {
      title: "In Maintenance",
      value: vehicleCounts?.maintenance || 0,
      icon: Wrench,
      color: "text-[#F97316]",
      bgColor: "bg-[#F97316]/10",
    },
    {
      title: "Needs Attention",
      value: vehicleCounts?.needsAttention || 0,
      icon: AlertTriangle,
      color: "text-[#ea384c]",
      bgColor: "bg-[#ea384c]/10",
    },
  ];

  // Generate dynamic stats cards for other statuses
  const generateDynamicStats = () => {
    if (!vehicleCounts) return [];

    return Object.entries(vehicleCounts)
      .filter(([status]) => !['available', 'maintenance', 'needsAttention'].includes(status))
      .map(([status, count]) => {
        const config = statusConfig[status] || {
          icon: CarTaxiFront,
          color: "text-gray-500",
          bgColor: "bg-gray-100",
        };

        return {
          title: status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          value: count,
          icon: config.icon,
          color: config.color,
          bgColor: config.bgColor,
        };
      });
  };

  if (isLoadingCounts) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dynamicStats = generateDynamicStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {mainStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {dynamicStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          {dynamicStats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};