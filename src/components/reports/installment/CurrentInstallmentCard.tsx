import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CurrentInstallmentCard = () => {
  const { data: currentInstallments, isLoading } = useQuery({
    queryKey: ["current-installments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select(`
          *,
          lease:leases (
            agreement_number,
            monthly_payment,
            total_amount,
            customer:profiles (
              full_name
            )
          )
        `)
        .gte('due_date', new Date().toISOString())
        .order('due_date')
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Installments</CardTitle>
      </CardHeader>
      <CardContent>
        {currentInstallments?.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No upcoming installments found.</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInstallments?.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">
                    {installment.lease.agreement_number}
                  </TableCell>
                  <TableCell>{installment.lease.customer.full_name}</TableCell>
                  <TableCell>
                    {new Date(installment.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatCurrency(installment.amount)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      installment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : installment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};