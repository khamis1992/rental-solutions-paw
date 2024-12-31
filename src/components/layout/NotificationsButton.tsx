import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  type: 'overdue' | 'maintenance' | 'payment';
};

export const NotificationsButton = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const now = new Date().toISOString();
        
        // Fetch overdue vehicles with error handling
        const { data: overdueVehicles, error: overdueError } = await supabase
          .from('leases')
          .select(`
            id,
            end_date,
            vehicles(
              make,
              model,
              year
            )
          `)
          .lt('end_date', now)
          .eq('status', 'active')
          .limit(3);

        if (overdueError) {
          console.error("Error fetching overdue vehicles:", overdueError);
          toast.error("Failed to fetch overdue vehicles");
          return [];
        }

        // Fetch maintenance alerts
        const { data: maintenanceAlerts, error: maintenanceError } = await supabase
          .from('maintenance')
          .select(`
            id,
            scheduled_date,
            vehicles(
              make,
              model,
              year
            ),
            service_type
          `)
          .eq('status', 'scheduled')
          .lte('scheduled_date', now)
          .limit(3);

        if (maintenanceError) {
          console.error("Error fetching maintenance alerts:", maintenanceError);
          toast.error("Failed to fetch maintenance alerts");
          return [];
        }

        // Fetch overdue payments
        const { data: overduePayments, error: paymentsError } = await supabase
          .from('payment_schedules')
          .select(`
            id,
            due_date,
            amount,
            leases(
              vehicles(
                make,
                model,
                year
              )
            )
          `)
          .lt('due_date', now)
          .eq('status', 'pending')
          .limit(3);

        if (paymentsError) {
          console.error("Error fetching overdue payments:", paymentsError);
          toast.error("Failed to fetch overdue payments");
          return [];
        }

        const formattedNotifications: Notification[] = [
          ...(overdueVehicles?.map(vehicle => ({
            id: `overdue-${vehicle.id}`,
            message: `${vehicle.vehicles.year} ${vehicle.vehicles.make} ${vehicle.vehicles.model} is overdue for return`,
            created_at: vehicle.end_date,
            type: 'overdue' as const
          })) || []),
          ...(maintenanceAlerts?.map(alert => ({
            id: `maintenance-${alert.id}`,
            message: `Maintenance due for ${alert.vehicles.year} ${alert.vehicles.make} ${alert.vehicles.model}: ${alert.service_type}`,
            created_at: alert.scheduled_date,
            type: 'maintenance' as const
          })) || []),
          ...(overduePayments?.map(payment => ({
            id: `payment-${payment.id}`,
            message: `Payment of ${payment.amount} overdue for ${payment.leases.vehicles.year} ${payment.leases.vehicles.make} ${payment.leases.vehicles.model}`,
            created_at: payment.due_date,
            type: 'payment' as const
          })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return formattedNotifications;
      } catch (err) {
        console.error("Error in notifications query:", err);
        toast.error("Failed to fetch notifications");
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">
            No new notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-3">
              <span className="text-sm font-medium">{notification.message}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};