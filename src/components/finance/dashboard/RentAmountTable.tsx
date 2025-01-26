import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RentAmount {
  agreement_number: string;
  rent_amount: number;
}

export const RentAmountTable = () => {
  // Use the dashboard subscriptions hook for real-time updates
  useDashboardSubscriptions();

  const { data: rentAmounts, isLoading } = useQuery({
    queryKey: ["active-rent-amounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("agreement_number, rent_amount")
        .eq("status", "active")
        .order("agreement_number");

      if (error) throw error;
      return data as RentAmount[];
    },
  });

  const totalRentAmount = rentAmounts?.reduce(
    (sum, item) => sum + (item.rent_amount || 0),
    0
  ) || 0;

  if (isLoading) {
    return <div>Loading rent amounts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Agreement Rent Amounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agreement Number</TableHead>
              <TableHead className="text-right">Rent Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentAmounts?.map((item) => (
              <TableRow key={item.agreement_number}>
                <TableCell>{item.agreement_number}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.rent_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total Rent Amount</TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalRentAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};