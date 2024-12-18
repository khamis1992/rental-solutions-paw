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

      // Count each vehicle only once based on its status
      const counts = {
        available: vehicles.filter(v => v.status === 'available').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        needsAttention: vehicles.filter(v => ['accident', 'police_station'].includes(v.status)).length,
        policeStation: vehicles.filter(v => v.status === 'police_station').length,
        accident: vehicles.filter(v => v.status === 'accident').length,
        reserve: vehicles.filter(v => v.status === 'reserve').length,
        stolen: vehicles.filter(v => v.status === 'stolen').length,
      };

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

  const detailedStats = [
    {
      title: "Police Station",
      value: vehicleCounts?.policeStation || 0,
      icon: Shield,
      color: "text-[#3b82f6]",
      bgColor: "bg-[#3b82f6]/10",
    },
    {
      title: "Accident",
      value: vehicleCounts?.accident || 0,
      icon: AlertCircle,
      color: "text-[#dc2626]",
      bgColor: "bg-[#dc2626]/10",
    },
    {
      title: "Reserve",
      value: vehicleCounts?.reserve || 0,
      icon: CarTaxiFront,
      color: "text-[#059669]",
      bgColor: "bg-[#059669]/10",
    },
    {
      title: "Stolen",
      value: vehicleCounts?.stolen || 0,
      icon: ShieldAlert,
      color: "text-[#7c3aed]",
      bgColor: "bg-[#7c3aed]/10",
    },
  ];

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
      <div className="grid gap-4 md:grid-cols-4">
        {detailedStats.map((stat) => (
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
    </div>
  );
};