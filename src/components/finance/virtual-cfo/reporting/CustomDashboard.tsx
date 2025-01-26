import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";

export const CustomDashboard = () => {
  // Use the dashboard subscriptions hook for real-time updates
  useDashboardSubscriptions();

  const { data: activeAgreements, isLoading } = useQuery({
    queryKey: ["active-rent-amounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          agreement_number,
          rent_amount
        `)
        .eq("status", "active")
        .order("agreement_number");

      if (error) throw error;
      return data;
    },
  });

  const totalRentAmount = activeAgreements?.reduce(
    (sum, item) => sum + (item.rent_amount || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading rent amounts...
                  </TableCell>
                </TableRow>
              ) : activeAgreements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No active agreements found
                  </TableCell>
                </TableRow>
              ) : (
                activeAgreements?.map((item) => (
                  <TableRow key={item.agreement_number}>
                    <TableCell>{item.agreement_number}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.rent_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
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

      {/* Other dashboard components can be added here */}
    </div>
  );
};
