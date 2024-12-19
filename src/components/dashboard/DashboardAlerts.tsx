import { BellRing, AlertTriangle, DollarSign, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const DashboardAlerts = () => {
  const navigate = useNavigate();
  
  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // Fetch overdue vehicles with proper error handling
      const { data: overdueVehicles = [] } = await supabase
        .from("leases")
        .select(`
          id,
          vehicles (
            id, make, model, year
          ),
          profiles (
            full_name
          )
        `)
        .lt("end_date", now)
        .eq("status", "active");

      // Fetch overdue payments with proper error handling
      const { data: overduePayments = [] } = await supabase
        .from("payment_schedules")
        .select(`
          id,
          leases (
            id,
            profiles (
              full_name
            )
          )
        `)
        .lt("due_date", now)
        .eq("status", "pending");

      // Fetch maintenance alerts with proper error handling
      const { data: maintenanceAlerts = [] } = await supabase
        .from("maintenance")
        .select(`
          id,
          vehicles (
            id, make, model, year
          )
        `)
        .eq("status", "scheduled")
        .lte("scheduled_date", now);

      return {
        overdueVehicles: overdueVehicles || [],
        overduePayments: overduePayments || [],
        maintenanceAlerts: maintenanceAlerts || [],
      };
    },
    gcTime: 30000,
    staleTime: 15000,
  });

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleLeaseClick = (leaseId: string) => {
    navigate(`/agreements/${leaseId}`);
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-muted-foreground" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts?.overdueVehicles?.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleLeaseClick(vehicle.id)}
              className="flex items-center gap-4 p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-100 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-700">Overdue Vehicle</h4>
                <p className="text-sm text-red-600">
                  {vehicle.vehicles?.year} {vehicle.vehicles?.make} {vehicle.vehicles?.model} - 
                  {vehicle.profiles?.full_name}
                </p>
              </div>
            </div>
          ))}

          {alerts?.overduePayments?.map((payment) => (
            <div
              key={payment.id}
              onClick={() => handleLeaseClick(payment.leases?.id)}
              className="flex items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-500">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-700">Overdue Payment</h4>
                <p className="text-sm text-yellow-600">
                  {payment.leases?.profiles?.full_name}
                </p>
              </div>
            </div>
          ))}

          {alerts?.maintenanceAlerts?.map((maintenance) => (
            <div
              key={maintenance.id}
              onClick={() => handleVehicleClick(maintenance.vehicles?.id)}
              className="flex items-center gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-500">
                <Car className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-700">Maintenance Due</h4>
                <p className="text-sm text-blue-600">
                  {maintenance.vehicles?.year} {maintenance.vehicles?.make} {maintenance.vehicles?.model}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};