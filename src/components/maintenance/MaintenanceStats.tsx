import { Card, CardContent } from "@/components/ui/card";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MaintenanceRecord {
  id: string;
  status: string;
}

interface MaintenanceStatsProps {
  records: MaintenanceRecord[];
  isLoading: boolean;
}

export const MaintenanceStats = ({ records, isLoading }: MaintenanceStatsProps) => {
  const stats = {
    scheduled: records.filter((r) => r.status === "scheduled").length,
    inProgress: records.filter((r) => r.status === "in_progress").length,
    completed: records.filter((r) => r.status === "completed").length,
  };

  const statCards = [
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Wrench,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
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