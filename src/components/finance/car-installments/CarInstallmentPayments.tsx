import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarInstallmentPayment {
  id: string;
  cheque_number: string;
  amount: number;
  payment_date: string;
  drawee_bank: string;
  paid_amount: number;
  remaining_amount: number;
  status: string;
}

export const CarInstallmentPayments = ({ contractId }: { contractId: string }) => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["car-installment-payments", contractId],
    queryFn: async () => {
      console.log("Fetching payments for contract:", contractId);
      const { data, error } = await supabase
        .from("car_installment_payments")
        .select("*")
        .eq("contract_id", contractId)
        .order("payment_date", { ascending: true });

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
      console.log("Fetched payments:", data);
      return data as CarInstallmentPayment[];
    },
    // Add refetch interval to periodically check for new payments
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Installments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cheque Number</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid Amount</TableHead>
                <TableHead className="text-right">Remaining Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.cheque_number}</TableCell>
                  <TableCell>{format(new Date(payment.payment_date), "PP")}</TableCell>
                  <TableCell>{payment.drawee_bank}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium",
                      payment.paid_amount >= payment.amount ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(payment.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(payment.remaining_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {!payments?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};