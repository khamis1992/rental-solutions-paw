import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { SinglePaymentForm } from "./components/SinglePaymentForm";
import { BulkPaymentForm } from "./components/BulkPaymentForm";
import { format } from "date-fns";
import { useState } from "react";

export const CarInstallmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const { data: contract } = useQuery({
    queryKey: ['car-installment-contract', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_installment_contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['car-installment-payments', id],
    queryFn: async () => {
      console.log("Fetching payments for contract:", id);
      const { data, error } = await supabase
        .from('car_installment_payments')
        .select('*')
        .eq('contract_id', id)
        .order('payment_date', { ascending: true });

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
      
      console.log("Fetched payments:", data);
      return data;
    },
    enabled: !!id
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contract Details</h1>
        <div className="space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment</DialogTitle>
              </DialogHeader>
              <SinglePaymentForm 
                contractId={id!} 
                onSuccess={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Bulk Payments</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Bulk Payments</DialogTitle>
              </DialogHeader>
              <BulkPaymentForm 
                contractId={id!}
                onClose={() => setIsBulkDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {contract && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Car Type</div>
              <div className="font-medium">{contract.car_type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Contract Value</div>
              <div className="font-medium">{formatCurrency(contract.total_contract_value)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Amount Paid</div>
              <div className="font-medium">{formatCurrency(contract.amount_paid)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Amount Pending</div>
              <div className="font-medium">{formatCurrency(contract.amount_pending)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Installments</div>
              <div className="font-medium">{contract.total_installments}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Remaining Installments</div>
              <div className="font-medium">{contract.remaining_installments}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Number of Cars</div>
              <div className="font-medium">{contract.number_of_cars}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Price per Car</div>
              <div className="font-medium">{formatCurrency(contract.price_per_car)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Installments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div>Loading payments...</div>
          ) : (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cheque Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.cheque_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.drawee_bank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!payments?.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};