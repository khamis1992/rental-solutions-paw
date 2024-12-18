import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface DamageHistoryProps {
  vehicleId: string;
}

export const DamageHistory = ({ vehicleId }: DamageHistoryProps) => {
  const { data: damages, isLoading } = useQuery({
    queryKey: ["damages", vehicleId],
    queryFn: async () => {
      // First, get maintenance records for this vehicle
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("service_type, description, cost, scheduled_date")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Then get damage records
      const { data: damageData, error: damageError } = await supabase
        .from("damages")
        .select("*, leases(customer_id, profiles(full_name))")
        .eq("leases.vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (damageError) throw damageError;

      return {
        maintenance: maintenanceData || [],
        damages: damageData || []
      };
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Damage & Service History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Maintenance Records */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Wrench className="mr-2 h-4 w-4" />
              Service Records
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {damages?.maintenance.map((record, index) => (
                  <TableRow key={`maintenance-${index}`}>
                    <TableCell>
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.service_type}</TableCell>
                    <TableCell>{record.description || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(record.cost || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Damage Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Damage Reports</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Repair Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {damages?.damages.map((damage) => (
                  <TableRow key={damage.id}>
                    <TableCell>
                      {new Date(damage.reported_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{damage.description}</TableCell>
                    <TableCell>
                      {(damage.leases as any)?.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(damage.repair_cost || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};