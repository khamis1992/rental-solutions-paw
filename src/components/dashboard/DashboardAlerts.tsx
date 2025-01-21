import { Card } from "@/components/ui/card";
import { AlertTriangle, Bell } from "lucide-react";

export const DashboardAlerts = () => {
  return (
    <Card className="p-6 rounded-lg h-[300px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Vehicle Return Due</h3>
            <p className="text-sm text-muted-foreground">
              3 vehicles are due for return today
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Maintenance Required</h3>
            <p className="text-sm text-muted-foreground">
              5 vehicles are due for maintenance
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">New Bookings</h3>
            <p className="text-sm text-muted-foreground">
              2 new booking requests pending approval
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Payment Due</h3>
            <p className="text-sm text-muted-foreground">
              4 payments pending collection
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Insurance Expiring</h3>
            <p className="text-sm text-muted-foreground">
              Insurance for 2 vehicles expires this week
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};