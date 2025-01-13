import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { AlertTriangle, CheckCircle2, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoricalDeleteDialogOpen, setIsHistoricalDeleteDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['unified-payments', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_payments')
        .select(`
          id,
          amount,
          amount_paid,
          balance,
          payment_date,
          due_date,
          status,
          payment_method,
          description,
          late_fine_amount,
          days_overdue,
          type,
          reconciliation_status
        `)
        .eq('lease_id', agreementId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPaymentId) return;

    try {
      const { error } = await supabase
        .from("unified_payments")
        .delete()
        .eq("id", selectedPaymentId);

      if (error) throw error;

      toast.success("Payment deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["unified-payments", agreementId] });
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPaymentId(null);
    }
  };

  const handleDeleteHistoricalPayments = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-historical-payments', {
        method: 'POST',
        body: { agreementId }
      });

      if (error) throw error;

      toast.success("Historical payments deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["unified-payments", agreementId] });
    } catch (error) {
      console.error("Error deleting historical payments:", error);
      toast.error("Failed to delete historical payments");
    } finally {
      setIsHistoricalDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  // Calculate totals
  const totals = payments?.reduce((acc, payment) => {
    if (payment.status === "completed") {
      return {
        amountPaid: acc.amountPaid + (payment.amount_paid || 0),
        lateFines: acc.lateFines + (payment.late_fine_amount || 0),
        balance: acc.balance + (payment.balance || 0)
      };
    }
    return acc;
  }, { amountPaid: 0, lateFines: 0, balance: 0 }) || { amountPaid: 0, lateFines: 0, balance: 0 };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payment History</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setIsHistoricalDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Delete Pre-2025 Payments
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Amount Paid</div>
              <div className="text-lg font-semibold">{formatCurrency(totals.amountPaid)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Late Fines</div>
              <div className="text-lg font-semibold text-destructive">{formatCurrency(totals.lateFines)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-lg font-semibold">{formatCurrency(totals.balance)}</div>
            </div>
          </div>

          {/* Payment List */}
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {payment.payment_date ? formatDateToDisplay(new Date(payment.payment_date)) : 'No date'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.payment_method} - {payment.description || 'Payment'}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div>Amount: {formatCurrency(payment.amount)}</div>
                  <div>Amount Paid: {formatCurrency(payment.amount_paid)}</div>
                  {payment.late_fine_amount > 0 && (
                    <div className="text-destructive flex items-center justify-end gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Late Fine: {formatCurrency(payment.late_fine_amount)}
                    </div>
                  )}
                  {payment.balance > 0 && (
                    <div className="text-destructive">Balance: {formatCurrency(payment.balance)}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={payment.status === 'completed' ? 
                        'bg-green-50 text-green-600 border-green-200' : 
                        'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }
                    >
                      {payment.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {payment.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(payment.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No payment history found
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isHistoricalDeleteDialogOpen} onOpenChange={setIsHistoricalDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Historical Payments</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all payments made before 2025. This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHistoricalPayments}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Historical Payments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};