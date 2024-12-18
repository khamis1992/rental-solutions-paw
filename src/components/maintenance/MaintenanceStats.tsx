import { Card, CardContent } from "@/components/ui/card";
import { Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";

interface MaintenanceRecord {
  id: string;
  status: MaintenanceStatus;
}

export const MaintenanceStats = () => {
  // Query to get maintenance records
  const { data: records = [], isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("id, status");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Query to count vehicles in accident status
  const { data: accidentCount = 0, isLoading: isLoadingAccidents } = useQuery({
    queryKey: ["accident-vehicles-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("vehicles")
        .select("*", { count: 'exact', head: true })
        .eq("status", "accident");

      if (error) throw error;
      return count || 0;
    }
  });

  const stats = {
    active: records.filter((r) => r.status === "in_progress").length,
    urgent: records.filter((r) => r.status === "urgent").length + accidentCount,
    scheduled: records.filter((r) => r.status === "scheduled").length,
    completed: records.filter((r) => r.status === "completed").length,
  };

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.active,
      description: "+2 from yesterday",
      icon: Wrench,
      color: "text-blue-500",
    },
    {
      title: "Urgent Repairs",
      value: stats.urgent,
      description: "Requires immediate attention",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      description: "Next 7 days",
      icon: Clock,
      color: "text-gray-500",
    },
    {
      title: "Completed",
      value: stats.completed,
      description: "This month",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  if (isLoadingMaintenance || isLoadingAccidents) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
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
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};