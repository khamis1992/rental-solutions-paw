import { Card, CardContent } from "@/components/ui/card";
import { Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MaintenanceStatsProps {
  maintenanceData: any[];
}

export const MaintenanceStats = ({ maintenanceData }: MaintenanceStatsProps) => {
  const totalCost = maintenanceData.reduce((sum, record) => sum + (record.cost || 0), 0);
  const completedCount = maintenanceData.filter(record => record.status === 'completed').length;
  const pendingCount = maintenanceData.filter(record => record.status === 'scheduled').length;
  const urgentCount = maintenanceData.filter(record => record.status === 'urgent').length;

  return (
    <div className="grid gap-6 md:grid-cols-4 mb-6">
      <Card className="relative overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Cost
            </h3>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">QAR {totalCost}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Completed
            </h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{completedCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pending
            </h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{pendingCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Urgent
            </h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{urgentCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Maintenance Timeline</h3>
          {/* Timeline content */}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 hover:shadow-card-hover transition-shadow duration-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Maintenance</h3>
          {/* Upcoming maintenance content */}
        </CardContent>
      </Card>
    </div>
  );
};