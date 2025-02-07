
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface MaintenanceStatsProps {
  maintenanceData?: {
    id: string;
    status: string;
    cost?: number;
  }[];
}

export const MaintenanceStats = ({ maintenanceData = [] }: MaintenanceStatsProps) => {
  // Calculate total cost - only sum defined cost values
  const totalCost = maintenanceData?.reduce((sum, record) => 
    sum + (typeof record.cost === 'number' ? record.cost : 0), 0) || 0;

  // Count records by status
  const completedCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'completed').length || 0;
  
  const pendingCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'scheduled' || 
    record.status?.toLowerCase() === 'in_progress').length || 0;
  
  const urgentCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'urgent').length || 0;

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">Total Cost</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-4">
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-orange-100">
            <div className="h-full w-1/2 animate-pulse bg-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">{completedCount}</p>
            </div>
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-green-100">
            <div className="h-full w-1/2 animate-pulse bg-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 animate-pulse bg-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">Urgent</p>
              <p className="text-3xl font-bold">{urgentCount}</p>
            </div>
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-red-100">
            <div className="h-full w-1/2 animate-pulse bg-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

