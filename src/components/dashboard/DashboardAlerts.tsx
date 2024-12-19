import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar, CarFront } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface CustomerDetails {
  full_name: string;
}

interface AlertDetails {
  type: 'vehicle' | 'payment' | 'maintenance';
  title: string;
  vehicle?: VehicleDetails;
  customer?: CustomerDetails;
  id: string;
}

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
              id, make, model, year
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
              id,
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

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (!alerts || 
      (!alerts.overdueVehicles?.length && 
       !alerts.overduePayments?.length && 
       !alerts.maintenanceAlerts?.length)) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <TooltipProvider>
              <div className="space-y-2">
                {alerts.overdueVehicles?.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleAlertClick({
                      type: 'vehicle',
                      title: 'Overdue Vehicle Details',
                      vehicle: vehicle.vehicle,
                      customer: vehicle.customer,
                      id: vehicle.id
                    })}
                    className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-100 text-red-500 flex-shrink-0">
                      <CarFront className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-red-700 mb-0.5">Overdue Vehicle</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-red-600 truncate">
                            {vehicle.vehicle?.year} {vehicle.vehicle?.make} {vehicle.vehicle?.model} - {truncateText(vehicle.customer?.full_name || '')}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{vehicle.vehicle?.year} {vehicle.vehicle?.make} {vehicle.vehicle?.model} - {vehicle.customer?.full_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}

                {alerts.overduePayments?.map((payment) => (
                  <div
                    key={payment.id}
                    onClick={() => handleAlertClick({
                      type: 'payment',
                      title: 'Overdue Payment Details',
                      customer: payment.lease?.customer,
                      id: payment.id
                    })}
                    className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-500 flex-shrink-0">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-yellow-700 mb-0.5">Overdue Payment</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-yellow-600 truncate">
                            {truncateText(payment.lease?.customer?.full_name || '')}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{payment.lease?.customer?.full_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}

                {alerts.maintenanceAlerts?.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    onClick={() => handleAlertClick({
                      type: 'maintenance',
                      title: 'Maintenance Alert Details',
                      vehicle: maintenance.vehicle,
                      id: maintenance.id
                    })}
                    className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-500 flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-blue-700 mb-0.5">Maintenance Due</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-blue-600 truncate">
                            {maintenance.vehicle?.year} {maintenance.vehicle?.make} {maintenance.vehicle?.model}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{maintenance.vehicle?.year} {maintenance.vehicle?.make} {maintenance.vehicle?.model}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAlert?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedAlert?.type === 'vehicle' && (
              <div className="space-y-2">
                <p><strong>Vehicle:</strong> {selectedAlert.vehicle?.year} {selectedAlert.vehicle?.make} {selectedAlert.vehicle?.model}</p>
                <p><strong>Customer:</strong> {selectedAlert.customer?.full_name}</p>
              </div>
            )}
            {selectedAlert?.type === 'payment' && (
              <div className="space-y-2">
                <p><strong>Customer:</strong> {selectedAlert.customer?.full_name}</p>
                <p><strong>Status:</strong> Payment Overdue</p>
              </div>
            )}
            {selectedAlert?.type === 'maintenance' && (
              <div className="space-y-2">
                <p><strong>Vehicle:</strong> {selectedAlert.vehicle?.year} {selectedAlert.vehicle?.make} {selectedAlert.vehicle?.model}</p>
                <p><strong>Status:</strong> Maintenance Required</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}