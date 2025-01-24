import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

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
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Cost
            </h3>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Completed
            </h3>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{completedCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pending
            </h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Urgent
            </h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{urgentCount}</div>
        </CardContent>
      </Card>
    </div>
  );
};