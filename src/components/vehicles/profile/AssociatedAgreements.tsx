import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface AssociatedAgreementsProps {
  vehicleId: string;
}

export const AssociatedAgreements = ({ vehicleId }: AssociatedAgreementsProps) => {
  const { data: agreements, isLoading } = useQuery({
    queryKey: ["agreements", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          profiles:customer_id (
            full_name
          )
        `)
        .eq("vehicle_id", vehicleId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Associated Agreements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agreement #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements?.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell>{agreement.agreement_number}</TableCell>
                <TableCell>{agreement.profiles?.full_name}</TableCell>
                <TableCell>
                  {new Date(agreement.start_date).toLocaleDateString()} -{" "}
                  {new Date(agreement.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      agreement.status === "active"
                        ? "default"
                        : agreement.status === "pending_payment"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {agreement.status}
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