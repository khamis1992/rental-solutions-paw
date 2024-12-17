import { Search, Bell, Settings, UserRound, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  type: 'overdue' | 'maintenance' | 'payment';
};

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // Fetch overdue vehicles
      const { data: overdueVehicles } = await supabase
        .from('leases')
        .select('id, end_date, vehicles(make, model, year)')
        .lt('end_date', now)
        .eq('status', 'active')
        .limit(3);

      // Fetch maintenance alerts
      const { data: maintenanceAlerts } = await supabase
        .from('maintenance')
        .select('id, scheduled_date, vehicles(make, model, year), service_type')
        .eq('status', 'scheduled')
        .lte('scheduled_date', now)
        .limit(3);

      // Fetch overdue payments
      const { data: overduePayments } = await supabase
        .from('payment_schedules')
        .select('id, due_date, amount, leases(vehicles(make, model, year))')
        .lt('due_date', now)
        .eq('status', 'pending')
        .limit(3);

      // Transform the data into notifications
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
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, customers..."
                className="pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <UserRound className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {profile && (
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">Role: {profile.role}</p>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};