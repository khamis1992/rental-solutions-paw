import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  cost?: number;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface MaintenanceStatsProps {
  maintenanceData?: MaintenanceRecord[];
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
  
  // Count both explicit 'urgent' status and records from accident vehicles
  const urgentCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'urgent' || 
    record.service_type?.toLowerCase().includes('accident')).length || 0;

  console.log('Maintenance Data:', maintenanceData); // Debug log
  console.log('Stats:', { totalCost, completedCount, pendingCount, urgentCount }); // Debug log
  console.log('Urgent Records:', maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'urgent' || 
    record.service_type?.toLowerCase().includes('accident'))); // Debug specific urgent records

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