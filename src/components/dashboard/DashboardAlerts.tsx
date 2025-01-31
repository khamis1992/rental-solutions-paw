import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Car, Bell, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
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

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const [vehicleAlerts, paymentAlerts, maintenanceAlerts] = await Promise.all([
        // Fetch vehicle alerts
        supabase
          .from('leases')
          .select(`
            id,
            agreement_number,
            end_date,
            vehicle:vehicle_id (
              make, model, year
            ),
            customer:customer_id (
              full_name
            )
          `)
          .eq('status', 'active')
          .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Fetch payment alerts
        supabase
          .from('unified_payments')
          .select(`
            id,
            amount,
            due_date,
            lease:lease_id (
              agreement_number,
              customer:customer_id (
                full_name
              )
            )
          `)
          .eq('status', 'pending')
          .lte('due_date', new Date().toISOString()),

        // Fetch maintenance alerts
        supabase
          .from('maintenance')
          .select(`
            id,
            service_type,
            scheduled_date,
            vehicle:vehicle_id (
              make, model, year
            )
          `)
          .eq('status', 'scheduled')
          .lte('scheduled_date', new Date().toISOString())
      ]);

      const alerts: AlertGroup[] = [];

      // Process vehicle alerts
      vehicleAlerts.data?.forEach(alert => {
        alerts.push({
          id: alert.id,
          icon: <Car className="h-4 w-4 text-red-500" />,
          title: `Vehicle Return Due`,
          description: `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model} - ${alert.customer.full_name}`,
          type: 'vehicle',
          severity: 'high'
        });
      });

      // Process payment alerts
      paymentAlerts.data?.forEach(alert => {
        alerts.push({
          id: alert.id,
          icon: <Bell className="h-4 w-4 text-yellow-500" />,
          title: `Payment Overdue`,
          description: `Agreement ${alert.lease.agreement_number} - ${alert.lease.customer.full_name}`,
          type: 'payment',
          severity: 'medium'
        });
      });

      // Process maintenance alerts
      maintenanceAlerts.data?.forEach(alert => {
        alerts.push({
          id: alert.id,
          icon: <Calendar className="h-4 w-4 text-blue-500" />,
          title: `Maintenance Due`,
          description: `${alert.vehicle.year} ${alert.vehicle.make} ${alert.vehicle.model} - ${alert.service_type}`,
          type: 'maintenance',
          severity: 'low'
        });
      });

      return alerts;
    }
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
    type: 'vehicle' | 'payment' | 'maintenance'
  ) => {
    const filteredAlerts = alerts.filter(alert => alert.type === type);
    if (!filteredAlerts.length) return null;

    const isExpanded = expandedSections.includes(type);
    const displayAlerts = isExpanded ? filteredAlerts : filteredAlerts.slice(0, 1);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-muted-foreground">{title}</h3>
          {filteredAlerts.length > 1 && (
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
                  +{filteredAlerts.length - 1} more <ChevronDown className="h-3 w-3" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {renderAlertSection("Vehicle Returns", alerts, 'vehicle')}
            {renderAlertSection("Payment Alerts", alerts, 'payment')}
            {renderAlertSection("Maintenance Alerts", alerts, 'maintenance')}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}