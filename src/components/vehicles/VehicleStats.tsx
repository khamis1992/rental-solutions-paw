import { Card, CardContent } from "@/components/ui/card";
import { Car, Wrench, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Vehicle {
  id: string;
  status: string;
}

interface VehicleStatsProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleStats = ({ vehicles, isLoading }: VehicleStatsProps) => {
  const stats = {
    available: vehicles.filter((v) => v.status === "available").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    service: vehicles.filter((v) => v.status === "maintenance").length, // In a real app, we'd have a separate status for vehicles due for service
  };

  const statCards = [
    {
      title: "Available Vehicles",
      value: stats.available,
      icon: Car,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "In Maintenance",
      value: stats.maintenance,
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Due for Service",
      value: stats.service,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {statCards.map((stat) => (
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
  );
};