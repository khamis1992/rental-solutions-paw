import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
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
      const { data, error } = await supabase
        .from("damages")
        .select("*, leases(customer_id, profiles(full_name))")
        .eq("leases.vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Damage Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {damages?.map((damage) => (
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
      </CardContent>
    </Card>
  );
};