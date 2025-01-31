import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarFront, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationsButton = () => {
  const { data: alerts } = useQuery({
    queryKey: ["notifications-alerts"],
    queryFn: async () => {
      const [overdueVehicles, overduePayments, maintenanceAlerts] = await Promise.all([
        supabase
          .from("leases")
          .select(`
            id,
            vehicle:vehicle_id (
              id, make, model, year, license_plate
            ),
            customer:customer_id (
              full_name
            )
          `)
          .gt("end_date", new Date().toISOString())
          .eq("status", "active"),

        supabase
          .from("payment_schedules")
          .select(`
            id,
            lease:lease_id (
              customer:customer_id (
                full_name
              )
            )
          `)
          .lt("due_date", new Date().toISOString())
          .eq("status", "pending"),

        supabase
          .from("maintenance")
          .select(`
            id,
            vehicle:vehicle_id (
              id, make, model, year, license_plate
            )
          `)
          .eq("status", "scheduled")
          .lt("scheduled_date", new Date().toISOString()),
      ]);

      return {
        overdueVehicles: overdueVehicles.data || [],
        overduePayments: overduePayments.data || [],
        maintenanceAlerts: maintenanceAlerts.data || [],
      };
    },
  });

  const totalAlerts = 
    (alerts?.overdueVehicles?.length || 0) + 
    (alerts?.overduePayments?.length || 0) + 
    (alerts?.maintenanceAlerts?.length || 0);

  const AlertSection = ({ 
    title, 
    count, 
    alerts, 
    icon: Icon, 
    bgColor 
  }: { 
    title: string;
    count: number;
    alerts: any[];
    icon: any;
    bgColor: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {count > 1 && (
          <Badge variant="secondary" className="text-xs">
            +{count - 1} more
          </Badge>
        )}
      </div>
      {alerts.slice(0, 1).map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
            bgColor
          )}
        >
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-0.5">
              {title === "Vehicle Returns" && "Overdue Vehicle"}
              {title === "Payment Alerts" && "Overdue Payment"}
              {title === "Maintenance Alerts" && "Maintenance Due"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {title === "Vehicle Returns" && alert.vehicle && alert.customer && 
                `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model} - ${alert.customer.full_name}`}
              {title === "Payment Alerts" && alert.lease?.customer && 
                alert.lease.customer.full_name}
              {title === "Maintenance Alerts" && alert.vehicle && 
                `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {totalAlerts > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {totalAlerts}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {alerts?.overdueVehicles && alerts.overdueVehicles.length > 0 && (
                  <AlertSection
                    title="Vehicle Returns"
                    count={alerts.overdueVehicles.length}
                    alerts={alerts.overdueVehicles}
                    icon={CarFront}
                    bgColor="border-red-200 bg-red-50 hover:bg-red-100"
                  />
                )}
                {alerts?.overduePayments && alerts.overduePayments.length > 0 && (
                  <AlertSection
                    title="Payment Alerts"
                    count={alerts.overduePayments.length}
                    alerts={alerts.overduePayments}
                    icon={AlertCircle}
                    bgColor="border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
                  />
                )}
                {alerts?.maintenanceAlerts && alerts.maintenanceAlerts.length > 0 && (
                  <AlertSection
                    title="Maintenance Alerts"
                    count={alerts.maintenanceAlerts.length}
                    alerts={alerts.maintenanceAlerts}
                    icon={Calendar}
                    bgColor="border-blue-200 bg-blue-50 hover:bg-blue-100"
                  />
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};