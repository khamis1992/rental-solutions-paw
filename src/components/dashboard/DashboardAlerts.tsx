import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Car, Bell, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertGroup {
  id: string;
  icon: JSX.Element;
  title: string;
  description: string;
  type: 'vehicle' | 'payment' | 'maintenance';
  severity: 'high' | 'medium' | 'low';
}

export function DashboardAlerts() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const { data: alerts } = useQuery({
    queryKey: ["dashboard-alerts"],
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
              id, make, model, year
            )
          `)
          .eq("status", "scheduled")
          .lt("scheduled_date", new Date().toISOString()),
      ]);

      return {
        vehicles: overdueVehicles.data || [],
        payments: overduePayments.data || [],
        maintenance: maintenanceAlerts.data || [],
      };
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getAlertStyle = (type: 'vehicle' | 'payment' | 'maintenance') => {
    switch (type) {
      case 'vehicle':
        return 'bg-red-50 border-red-100 hover:bg-red-100';
      case 'payment':
        return 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100';
      case 'maintenance':
        return 'bg-blue-50 border-blue-100 hover:bg-blue-100';
    }
  };

  const renderAlertSection = (
    title: string,
    alerts: AlertGroup[],
    type: 'vehicle' | 'payment' | 'maintenance',
    count: number
  ) => {
    const isExpanded = expandedSections.includes(type);
    const displayAlerts = isExpanded ? alerts : alerts.slice(0, 1);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-muted-foreground">{title}</h3>
          {alerts.length > 1 && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleSection(type)}
            >
              {isExpanded ? (
                <span className="flex items-center gap-1">
                  Show less <ChevronUp className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  +{count - 1} more <ChevronDown className="h-3 w-3" />
                </span>
              )}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                getAlertStyle(alert.type)
              )}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/50">
                {alert.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-0.5">{alert.title}</h4>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const vehicleAlerts: AlertGroup[] = (alerts?.vehicles || []).map(v => ({
    id: v.id,
    icon: <Car className="h-4 w-4 text-red-500" />,
    title: "Overdue Vehicle",
    description: `${v.vehicle.year} ${v.vehicle.make} ${v.vehicle.model} - ${v.customer.full_name}`,
    type: 'vehicle',
    severity: 'high'
  }));

  const paymentAlerts: AlertGroup[] = (alerts?.payments || []).map(p => ({
    id: p.id,
    icon: <Bell className="h-4 w-4 text-yellow-500" />,
    title: "Overdue Payment",
    description: p.lease.customer.full_name,
    type: 'payment',
    severity: 'medium'
  }));

  const maintenanceAlerts: AlertGroup[] = (alerts?.maintenance || []).map(m => ({
    id: m.id,
    icon: <Calendar className="h-4 w-4 text-blue-500" />,
    title: "Maintenance Due",
    description: `${m.vehicle.year} ${m.vehicle.make} ${m.vehicle.model}`,
    type: 'maintenance',
    severity: 'low'
  }));

  if (!alerts || 
      (!alerts.vehicles.length && 
       !alerts.payments.length && 
       !alerts.maintenance.length)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {vehicleAlerts.length > 0 && renderAlertSection(
              "Vehicle Returns",
              vehicleAlerts,
              'vehicle',
              vehicleAlerts.length
            )}
            
            {paymentAlerts.length > 0 && renderAlertSection(
              "Payment Alerts",
              paymentAlerts,
              'payment',
              paymentAlerts.length
            )}
            
            {maintenanceAlerts.length > 0 && renderAlertSection(
              "Maintenance Alerts",
              maintenanceAlerts,
              'maintenance',
              maintenanceAlerts.length
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}