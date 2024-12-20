import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface RentPayment {
  id: string;
  lease_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: string;
  fine_amount: number | null;
  lease: {
    agreement_number: string;
    customer: {
      full_name: string;
    };
  };
}

export const RentManagementSection = () => {
  const { data: rentPayments, isLoading } = useQuery({
    queryKey: ["rent-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rent_payments")
        .select(`
          *,
          lease:leases (
            agreement_number,
            customer:profiles (
              full_name
            )
          )
        `)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data as RentPayment[];
    },
  });

  const totalRentCollected = rentPayments?.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  const totalPendingRent = rentPayments?.reduce((sum, payment) => {
    if (payment.status === "pending") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  const totalFines = rentPayments?.reduce((sum, payment) => {
    return sum + (payment.fine_amount || 0);
  }, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(totalRentCollected)}</div>
              <p className="text-muted-foreground">Total Rent Collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(totalPendingRent)}</div>
              <p className="text-muted-foreground">Pending Rent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(totalFines)}</div>
              <p className="text-muted-foreground">Total Late Fees</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Late Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading rent payments...</TableCell>
                </TableRow>
              ) : rentPayments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No rent payments found</TableCell>
                </TableRow>
              ) : (
                rentPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.lease.agreement_number}</TableCell>
                    <TableCell>{payment.lease.customer.full_name}</TableCell>
                    <TableCell>{format(new Date(payment.due_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {payment.fine_amount ? formatCurrency(payment.fine_amount) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === "completed" ? "success" : "warning"}
                        className="capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.payment_date
                        ? format(new Date(payment.payment_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};