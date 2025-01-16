import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { InvoiceDialog } from "../InvoiceDialog";
import { FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const { data: payments, isLoading } = useQuery({
    queryKey: ["agreement-payments", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history_view")
        .select("*")
        .eq("lease_id", agreementId)
        .order("actual_payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate totals
  const totals = payments?.reduce((acc, payment) => {
    const baseAmount = payment.amount || 0;
    const amountPaid = payment.amount_paid || 0;
    const lateFine = payment.late_fine_amount || 0;
    const isPending = payment.status === 'pending';

    return {
      amountPaid: acc.amountPaid + amountPaid,
      lateFines: acc.lateFines + lateFine,
      totalBalance: acc.totalBalance + (isPending ? baseAmount : 0) // Only sum pending payments
    };
  }, { amountPaid: 0, lateFines: 0, totalBalance: 0 }) || 
  { amountPaid: 0, lateFines: 0, totalBalance: 0 };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <Button onClick={() => setSelectedInvoiceId(agreementId)} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
          <p className="text-lg font-semibold">{formatCurrency(totals.amountPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Late Fines</p>
          <p className="text-lg font-semibold text-destructive">{formatCurrency(totals.lateFines)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className={`text-lg font-semibold ${totals.totalBalance === 0 ? 'text-green-600' : ''}`}>
            {formatCurrency(totals.totalBalance)}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Date</TableHead>
            <TableHead>Due Amount</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Late Fine</TableHead>
            <TableHead>Total Due</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => {
            const remainingBalance = Math.max(0, (payment.amount || 0) - (payment.amount_paid || 0));
            
            return (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.actual_payment_date 
                    ? format(new Date(payment.actual_payment_date), 'dd/MM/yyyy')
                    : '-'}
                </TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                <TableCell className="text-destructive">
                  {payment.late_fine_amount ? formatCurrency(payment.late_fine_amount) : '-'}
                  {payment.days_overdue > 0 && (
                    <span className="text-xs ml-1">
                      ({payment.days_overdue} days)
                    </span>
                  )}
                </TableCell>
                <TableCell className={remainingBalance === 0 ? 'text-green-600' : 'text-destructive'}>
                  {formatCurrency(remainingBalance)}
                </TableCell>
                <TableCell className="capitalize">
                  {payment.status?.toLowerCase() || '-'}
                </TableCell>
              </TableRow>
            );
          })}
          {!payments?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No payment history found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <InvoiceDialog
        agreementId={selectedInvoiceId || ""}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      />
    </div>
  );
};