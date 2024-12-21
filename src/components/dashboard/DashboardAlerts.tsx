import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { AlertItem } from "./AlertItem";
import { AlertDetailsDialog } from "./AlertDetailsDialog";
import { AlertDetails } from "./types/alert-types";
import { Button } from "@/components/ui/button";

export function DashboardAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  if (!alerts || 
      (!alerts.overdueVehicles?.length && 
       !alerts.overduePayments?.length && 
       !alerts.maintenanceAlerts?.length)) {
    return null;
  }

  return (
    <>
      <Card className="border rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Alerts & Notifications</CardTitle>
          <Button variant="link" className="text-blue-500 font-medium">
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div>
            {alerts.overdueVehicles?.map((vehicle) => (
              <AlertItem
                key={vehicle.id}
                alert={{
                  type: 'vehicle',
                  title: 'Overdue Vehicle Details',
                  vehicle: vehicle.vehicle,
                  customer: vehicle.customer,
                  id: vehicle.id
                }}
                onClick={() => handleAlertClick({
                  type: 'vehicle',
                  title: 'Overdue Vehicle Details',
                  vehicle: vehicle.vehicle,
                  customer: vehicle.customer,
                  id: vehicle.id
                })}
              />
            ))}

            {alerts.overduePayments?.map((payment) => (
              <AlertItem
                key={payment.id}
                alert={{
                  type: 'payment',
                  title: 'Overdue Payment Details',
                  customer: payment.lease?.customer,
                  id: payment.id
                }}
                onClick={() => handleAlertClick({
                  type: 'payment',
                  title: 'Overdue Payment Details',
                  customer: payment.lease?.customer,
                  id: payment.id
                })}
              />
            ))}

            {alerts.maintenanceAlerts?.map((maintenance) => (
              <AlertItem
                key={maintenance.id}
                alert={{
                  type: 'maintenance',
                  title: 'Maintenance Alert Details',
                  vehicle: maintenance.vehicle,
                  id: maintenance.id
                }}
                onClick={() => handleAlertClick({
                  type: 'maintenance',
                  title: 'Maintenance Alert Details',
                  vehicle: maintenance.vehicle,
                  id: maintenance.id
                })}
              />
            ))}
          </div>
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