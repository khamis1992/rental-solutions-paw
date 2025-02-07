import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadSection } from "@/components/agreements/payment-import/FileUploadSection";
import { Button } from "@/components/ui/button";
import { AddPaymentDialog } from "./components/AddPaymentDialog";
import { formatDateToDisplay } from "@/lib/dateUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Calendar,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";

interface CsvRow {
  cheque_number: string;
  amount: string;
  payment_date: string;
  drawee_bank: string;
}

interface RecordPaymentDialogProps {
  payment: any;
  onClose: () => void;
  open: boolean;
}

const RecordPaymentDialog = ({ payment, onClose, open }: RecordPaymentDialogProps) => {
  const queryClient = useQueryClient();
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const remainingAmount = payment.amount - paidAmount;
      const newPaidTotal = (payment.paid_amount || 0) + paidAmount;
      const newStatus = remainingAmount <= 0 ? 'paid' : 'pending';

      const { error } = await supabase
        .from('car_installment_payments')
        .update({
          paid_amount: newPaidTotal,
          remaining_amount: remainingAmount,
          status: newStatus,
          last_payment_date: new Date().toISOString(),
          payment_notes: notes || payment.payment_notes
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Cheque Number</Label>
              <Input value={payment.cheque_number} disabled />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input value={payment.amount} disabled />
            </div>
            <div>
              <Label>Previously Paid</Label>
              <Input value={payment.paid_amount || 0} disabled />
            </div>
            <div>
              <Label>Payment Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add payment notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const CarInstallmentDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["car-installment-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_installment_payments")
        .select("*")
        .eq("contract_id", id)
        .order('payment_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: contract } = useQuery({
    queryKey: ["car-installment-contract", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_installment_contracts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'car_installment_payments',
          filter: `contract_id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
        }
      )
      .subscribe();

    const contractChannel = supabase
      .channel('contract-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'car_installment_contracts',
          filter: `id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['car-installment-contract'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(contractChannel);
    };
  }, [id, queryClient]);

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const { data: paymentData } = await supabase
        .from('car_installment_payments')
        .select('amount')
        .eq('id', paymentId)
        .single();

      if (!paymentData) throw new Error('Payment not found');

      let updateData: any = {
        status: newStatus,
        last_status_change: new Date().toISOString()
      };

      if (newStatus === 'paid') {
        updateData = {
          ...updateData,
          paid_amount: paymentData.amount,
          remaining_amount: 0,
          last_payment_date: new Date().toISOString()
        };
      } else if (newStatus === 'pending' || newStatus === 'overdue') {
        updateData = {
          ...updateData,
          paid_amount: 0,
          remaining_amount: paymentData.amount
        };
      } else if (newStatus === 'cancelled') {
        updateData = {
          ...updateData,
          paid_amount: 0,
          remaining_amount: 0
        };
      }

      const { error } = await supabase
        .from('car_installment_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;
      
      toast.success("Status updated successfully");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const text = await file.text();
      
      Papa.parse<CsvRow>(text, {
        header: true,
        complete: async (results) => {
          const parsedData = results.data;
          
          for (const row of parsedData) {
            try {
              if (!row.cheque_number || !row.amount || !row.payment_date || !row.drawee_bank) {
                errorCount++;
                toast.error(`Missing required fields for cheque ${row.cheque_number || 'unknown'}`);
                continue;
              }

              const { data: existingCheques } = await supabase
                .from('car_installment_payments')
                .select('cheque_number')
                .eq('cheque_number', row.cheque_number);

              if (existingCheques && existingCheques.length > 0) {
                errorCount++;
                toast.error(`Cheque number ${row.cheque_number} already exists`);
                continue;
              }

              const { error: insertError } = await supabase
                .from('car_installment_payments')
                .insert({
                  contract_id: id,
                  cheque_number: row.cheque_number,
                  amount: parseFloat(row.amount),
                  payment_date: row.payment_date,
                  drawee_bank: row.drawee_bank,
                  paid_amount: 0,
                  remaining_amount: parseFloat(row.amount),
                  status: 'pending'
                });

              if (insertError) {
                errorCount++;
                console.error('Import error:', insertError);
                toast.error(`Failed to import cheque ${row.cheque_number}`);
              } else {
                successCount++;
              }
            } catch (error: any) {
              errorCount++;
              console.error('Error processing row:', error);
              toast.error(error.message || 'Failed to process row');
            }
          }

          await queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
          toast.success(`Import completed: ${successCount} successful, ${errorCount} failed`);
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          toast.error('Failed to parse CSV file');
        }
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'cheque_number,amount,payment_date,drawee_bank',
      '1234,5000,2024-03-01,Qatar National Bank',
      '1235,5000,2024-04-01,Qatar National Bank'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'car_installment_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalAmount = contract?.total_contract_value || 0;
  const totalPaid = contract?.amount_paid || 0;
  const totalPending = contract?.amount_pending || 0;
  const overduePayments = payments?.filter(p => 
    p.status === 'pending' && new Date(p.payment_date) < new Date()
  ).length || 0;
  const completionPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
  const pendingPercentage = totalAmount > 0 ? (totalPending / totalAmount) * 100 : 0;

  const filteredPayments = payments?.filter(payment => {
    if (selectedFilter === "all") return true;
    return payment.status === selectedFilter;
  });

  return (
    <div className="space-y-6 p-6 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:scale-105 transition-transform duration-200 overflow-hidden bg-gradient-to-br from-[#dfeaf7] to-[#f4f8fc] dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Amount
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(totalAmount)}
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {completionPercentage.toFixed(1)}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200 overflow-hidden bg-gradient-to-br from-[#e6b980] to-[#eacda3] dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Paid
              <Receipt className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(totalPaid)}
            </div>
            <Progress 
              value={(totalPaid / totalAmount) * 100} 
              className="h-2 mt-2 bg-green-100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {((totalPaid / totalAmount) * 100).toFixed(1)}% of total amount
            </p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200 overflow-hidden bg-gradient-to-br from-[#ffa485] to-[#ff7b7b] dark:from-red-900/20 dark:to-red-800/20 border border-red-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Pending Amount
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(totalPending)}
            </div>
            <Progress 
              value={pendingPercentage} 
              className="h-2 mt-2 bg-red-100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {pendingPercentage.toFixed(1)}% pending payment
            </p>
          </CardContent>
        </Card>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className={`hover:scale-105 transition-transform duration-200 overflow-hidden 
              ${overduePayments > 0 
                ? 'bg-gradient-to-br from-[#ee7171] to-[#f6d794] dark:from-red-900/20 dark:to-orange-800/20 border-red-100/50' 
                : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-100/50'
              } relative cursor-pointer`}>
              {overduePayments > 0 && (
                <span className="absolute top-2 right-2 animate-pulse">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </span>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overdue Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overduePayments}
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  {overduePayments > 0 ? (
                    <>
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span>Requires immediate attention</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>All payments up to date</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Overdue Payments</h4>
              <p className="text-sm text-muted-foreground">
                {overduePayments > 0
                  ? `${overduePayments} payment${overduePayments > 1 ? 's' : ''} ${overduePayments > 1 ? 'have' : 'is'} passed their due date and ${overduePayments > 1 ? 'are' : 'is'} still pending.`
                  : "All payments are up to date. No overdue payments found."}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <Card className="shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Installments
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] })}
                className="hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowAddPayment(true)}
                className="hover:scale-105 transition-transform bg-gradient-to-r from-primary to-primary-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FileUploadSection
            onFileUpload={handleFileUpload}
            onDownloadTemplate={downloadTemplate}
            isUploading={isUploading}
            isAnalyzing={isAnalyzing}
          />
          
          <ScrollArea className="h-[600px] mt-6">
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drawee Bank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments?.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          {payment.cheque_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                        {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(payment.paid_amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                        {new Intl.NumberFormat('en-QA', { style: 'currency', currency: 'QAR' }).format(payment.remaining_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDateToDisplay(payment.payment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.drawee_bank}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={payment.status}
                          onValueChange={(value) => handleStatusChange(payment.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center">
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mr-2">⏳</Badge>
                                Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="paid">
                              <span className="flex items-center">
                                <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">✓</Badge>
                                Paid
                              </span>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <span className="flex items-center">
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 mr-2">✕</Badge>
                                Cancelled
                              </span>
                            </SelectItem>
                            <SelectItem value="overdue">
                              <span className="flex items-center">
                                <Badge variant="outline" className="bg-red-100 text-red-800 mr-2">⚠️</Badge>
                                Overdue
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPayment(payment)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                          title="Record Payment"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!filteredPayments?.length && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
        contractId={id!}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['car-installment-payments'] });
        }}
      />

      {selectedPayment && (
        <RecordPaymentDialog
          payment={selectedPayment}
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};
