import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AgreementsHistoryProps {
  customerId: string;
}

export const AgreementsHistory = ({ customerId }: AgreementsHistoryProps) => {
  const { data: agreements, isLoading } = useQuery({
    queryKey: ["customer-agreements", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          vehicle:vehicle_id (
            make,
            model,
            license_plate
          )
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading agreements...</div>;
  }

  if (!agreements || agreements.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No agreements found for this customer.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agreement Number</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell>{agreement.agreement_number}</TableCell>
                <TableCell>
                  {agreement.vehicle ? (
                    <>
                      {agreement.vehicle.make} {agreement.vehicle.model}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {agreement.vehicle.license_plate}
                      </span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
                <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
                <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
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