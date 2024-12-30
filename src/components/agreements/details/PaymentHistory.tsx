import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Payment } from "@/types/database/payment.types";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["agreement-payments", agreementId],
    queryFn: async () => {
      console.log("Fetching payments for agreement:", agreementId);
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("lease_id", agreementId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      console.log("Fetched payments:", data);
      return data as Payment[];
    },
  });

  // Set up real-time subscription for payments
  useEffect(() => {
    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `lease_id=eq.${agreementId}`
        },
        () => {
          console.log('Payment update received, refreshing data');
          queryClient.invalidateQueries({ queryKey: ["agreement-payments", agreementId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agreementId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payment Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.length ? (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.payment_date 
                    ? format(new Date(payment.payment_date), 'dd/MM/yyyy')
                    : format(new Date(payment.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{payment.amount} QAR</TableCell>
                <TableCell>{payment.amount_paid || 0} QAR</TableCell>
                <TableCell>{payment.balance || 0} QAR</TableCell>
                <TableCell>{payment.description || '-'}</TableCell>
                <TableCell className="capitalize">
                  {payment.payment_method?.toLowerCase().replace('_', ' ') || '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No payment history found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};