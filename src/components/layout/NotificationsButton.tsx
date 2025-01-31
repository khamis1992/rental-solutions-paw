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
import { CarFront, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

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
            ),
            created_at
          `)
          .gt("end_date", new Date().toISOString())
          .eq("status", "active"),

        supabase
          .from("payment_schedules")
          .select(`
            id,
            created_at,
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
            created_at,
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

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) {
        return "Invalid date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const AlertSection = ({ 
    title, 
    count, 
    alerts, 
    icon: Icon, 
    bgColor,
    textColor = "text-foreground",
    badgeVariant = "default"
  }: { 
    title: string;
    count: number;
    alerts: any[];
    icon: any;
    bgColor: string;
    textColor?: string;
    badgeVariant?: "default" | "destructive" | "warning";
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${textColor}`} />
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        {count > 0 && (
          <Badge variant={badgeVariant} className="text-xs">
            {count} {count === 1 ? 'Alert' : 'Alerts'}
          </Badge>
        )}
      </div>
      {alerts.slice(0, 1).map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer group",
            bgColor,
            "hover:bg-accent/10"
          )}
        >
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-0.5">
              {title === "Vehicle Returns" && "Overdue Vehicle"}
              {title === "Payment Alerts" && "Overdue Payment"}
              {title === "Maintenance Alerts" && "Maintenance Due"}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {title === "Vehicle Returns" && alert.vehicle && alert.customer && 
                `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model} - ${alert.customer.full_name}`}
              {title === "Payment Alerts" && alert.lease?.customer && 
                alert.lease.customer.full_name}
              {title === "Maintenance Alerts" && alert.vehicle && 
                `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {alert.created_at ? formatTimeAgo(alert.created_at) : "Date not available"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
      {count > 1 && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
          View all {count} alerts
        </Button>
      )}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {totalAlerts > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center animate-in zoom-in">
              {totalAlerts}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ScrollArea className="h-[400px] pr-4">
              {alerts?.overdueVehicles && alerts.overdueVehicles.length > 0 && (
                <AlertSection
                  title="Vehicle Returns"
                  count={alerts.overdueVehicles.length}
                  alerts={alerts.overdueVehicles}
                  icon={CarFront}
                  bgColor="border-red-200 bg-red-50"
                  textColor="text-red-500"
                  badgeVariant="destructive"
                />
              )}
              {alerts?.overduePayments && alerts.overduePayments.length > 0 && (
                <AlertSection
                  title="Payment Alerts"
                  count={alerts.overduePayments.length}
                  alerts={alerts.overduePayments}
                  icon={AlertCircle}
                  bgColor="border-yellow-200 bg-yellow-50"
                  textColor="text-yellow-500"
                  badgeVariant="warning"
                />
              )}
              {alerts?.maintenanceAlerts && alerts.maintenanceAlerts.length > 0 && (
                <AlertSection
                  title="Maintenance Alerts"
                  count={alerts.maintenanceAlerts.length}
                  alerts={alerts.maintenanceAlerts}
                  icon={Calendar}
                  bgColor="border-blue-200 bg-blue-50"
                  textColor="text-blue-500"
                />
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};