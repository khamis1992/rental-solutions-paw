import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface MaintenanceHistoryProps {
  vehicleId: string;
}

export const MaintenanceHistory = ({ vehicleId }: MaintenanceHistoryProps) => {
  const { data: records, isLoading } = useQuery({
    queryKey: ["maintenance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="mr-2 h-5 w-5" />
          Maintenance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.service_type}</TableCell>
                <TableCell>
                  {new Date(record.scheduled_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatCurrency(record.cost || 0)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "completed"
                        ? "default"
                        : record.status === "in_progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};