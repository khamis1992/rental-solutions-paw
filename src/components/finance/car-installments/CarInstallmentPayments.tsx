import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { type CarInstallmentPayment } from "@/types/finance/car-installment.types";
import { AddPaymentDialog } from "./components/AddPaymentDialog";
import { toast } from "sonner";

interface CarInstallmentPaymentsProps {
  contractId: string;
}

export const CarInstallmentPayments = ({ contractId }: CarInstallmentPaymentsProps) => {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  const { data: payments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["car-installment-payments", contractId],
    queryFn: async () => {
      if (!contractId) {
        console.log("No contractId provided");
        return [];
      }
      
      console.log("Fetching payments for contract:", contractId);
      
      const { data, error } = await supabase
        .from("car_installment_payments")
        .select("*")
        .eq("contract_id", contractId)
        .order("payment_date", { ascending: true });

      if (error) {
        console.error('Error fetching payments:', error);
        toast.error("Failed to load payments");
        throw error;
      }

      console.log("Fetched payments:", data);
      
      if (!data || data.length === 0) {
        console.log("No payments found for contract:", contractId);
      }

      return data as CarInstallmentPayment[];
    },
    enabled: !!contractId,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handlePaymentSuccess = () => {
    console.log("Payment added successfully, refreshing data...");
    refetch();
    setIsAddPaymentOpen(false);
  };

  if (error) {
    console.error("Query error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error loading payments. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Installments</CardTitle>
        <Button 
          onClick={() => setIsAddPaymentOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </CardHeader>
      <CardContent>
        {!payments?.length ? (
          <div className="text-center py-4 text-muted-foreground">
            No payments found
          </div>
        ) : (
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
                {payments.map((payment) => (
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
              </TableBody>
            </Table>
          </div>
        )}

        <AddPaymentDialog
          open={isAddPaymentOpen}
          onOpenChange={setIsAddPaymentOpen}
          contractId={contractId}
          onSuccess={handlePaymentSuccess}
        />
      </CardContent>
    </Card>
  );
};