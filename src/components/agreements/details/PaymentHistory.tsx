import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/lib/dateUtils";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PaymentHistoryProps {
  agreementId: string;
}

export const PaymentHistory = ({ agreementId }: PaymentHistoryProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
          type
        `)
        .eq('lease_id', agreementId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totals = payments?.reduce((acc, payment) => {
    const dueAmount = payment.amount;
    const amountPaid = payment.amount_paid || 0;
    const balance = payment.balance || Math.max(0, dueAmount - amountPaid);
    const lateFine = payment.late_fine_amount || 0;
    
    return {
      totalDue: acc.totalDue + dueAmount,
      amountPaid: acc.amountPaid + amountPaid,
      balance: acc.balance + balance,
      totalLateFines: acc.totalLateFines + lateFine,
    };
  }, { totalDue: 0, amountPaid: 0, balance: 0, totalLateFines: 0 }) || 
  { totalDue: 0, amountPaid: 0, balance: 0, totalLateFines: 0 };

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

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payment History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Due Amount</div>
              <div className="text-lg font-semibold">{formatCurrency(totals.totalDue)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Amount Paid</div>
              <div className="text-lg font-semibold">{formatCurrency(totals.amountPaid)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Late Fines</div>
              <div className="text-lg font-semibold text-destructive">{formatCurrency(totals.totalLateFines)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-lg font-semibold text-destructive">{formatCurrency(totals.balance)}</div>
            </div>
          </div>

          {/* Payment List */}
          {payments && payments.length > 0 ? (
            payments.map((payment) => {
              const dueAmount = payment.amount;
              const amountPaid = payment.amount_paid || 0;
              const balance = payment.balance || Math.max(0, dueAmount - amountPaid);
              const lateFine = payment.late_fine_amount || 0;
              const daysOverdue = payment.days_overdue || 0;
              
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {payment.payment_date ? formatDateToDisplay(new Date(payment.payment_date)) : 'No date'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.payment_method} - {payment.description || 'No Description'}
                    </div>
                    {daysOverdue > 0 && (
                      <div className="text-sm text-destructive">
                        {daysOverdue} days overdue
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div>Due Amount: {formatCurrency(dueAmount)}</div>
                    <div>Amount Paid: {formatCurrency(amountPaid)}</div>
                    {lateFine > 0 && (
                      <div className="text-destructive">Late Fine: {formatCurrency(lateFine)}</div>
                    )}
                    <div className={`${balance === 0 ? 'text-green-600' : 'text-destructive'}`}>
                      Balance: {formatCurrency(balance)}
                    </div>
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
              );
            })
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
    </Card>
  );
};