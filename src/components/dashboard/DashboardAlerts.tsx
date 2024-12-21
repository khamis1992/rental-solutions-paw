import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { AlertItem } from "./AlertItem";
import { AlertDetailsDialog } from "./AlertDetailsDialog";
import { AlertDetails } from "./types/alert-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DashboardAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
              full_name,
              phone_number
            )
          `)
          .gt("end_date", new Date().toISOString())
          .eq("status", "active"),

        supabase
          .from("payment_schedules")
          .select(`
            id,
            lease:lease_id (
              id,
              customer:customer_id (
                full_name,
                phone_number
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

  const handleAlertClick = (alert: AlertDetails) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const toggleGroupExpansion = (groupType: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupType) 
        ? prev.filter(type => type !== groupType)
        : [...prev, groupType]
    );
  };

  if (!alerts || 
      (!alerts.overdueVehicles?.length && 
       !alerts.overduePayments?.length && 
       !alerts.maintenanceAlerts?.length)) {
    return null;
  }

  const renderAlertGroup = (title: string, alerts: AlertDetails[], count: number, groupType: string) => {
    if (!alerts.length) return null;
    
    const isExpanded = expandedGroups.includes(groupType);
    const displayAlerts = isExpanded ? alerts : [alerts[0]];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {count > 1 && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => toggleGroupExpansion(groupType)}
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
            </div>
          )}
        </div>
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onClick={() => handleAlertClick(alert)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {renderAlertGroup(
                "Vehicle Returns", 
                alerts.overdueVehicles?.map(vehicle => ({
                  type: 'vehicle',
                  title: 'Overdue Vehicle Details',
                  vehicle: vehicle.vehicle,
                  customer: vehicle.customer,
                  id: vehicle.id
                })) || [],
                alerts.overdueVehicles?.length || 0,
                'vehicles'
              )}

              {renderAlertGroup(
                "Payment Alerts", 
                alerts.overduePayments?.map(payment => ({
                  type: 'payment',
                  title: 'Overdue Payment Details',
                  customer: payment.lease?.customer,
                  id: payment.id
                })) || [],
                alerts.overduePayments?.length || 0,
                'payments'
              )}

              {renderAlertGroup(
                "Maintenance Alerts", 
                alerts.maintenanceAlerts?.map(maintenance => ({
                  type: 'maintenance',
                  title: 'Maintenance Alert Details',
                  vehicle: maintenance.vehicle,
                  id: maintenance.id
                })) || [],
                alerts.maintenanceAlerts?.length || 0,
                'maintenance'
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDetailsDialog
        alert={selectedAlert}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}