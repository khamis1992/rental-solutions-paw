import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Calendar, DollarSign, Car, Tag } from "lucide-react";
import { CarInstallmentAnalytics } from "./CarInstallmentAnalytics";
import { PaymentMonitoring } from "./PaymentMonitoring";
import { CarInstallmentPayments } from "./CarInstallmentPayments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const CarInstallmentDetails = () => {
  const { id } = useParams();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contract, isLoading } = useQuery({
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

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const paymentData = {
      contract_id: id,
      cheque_number: formData.get("chequeNumber"),
      amount: Number(formData.get("amount")),
      payment_date: formData.get("paymentDate"),
      drawee_bank: formData.get("draweeBankName"),
      paid_amount: Number(formData.get("paidAmount")),
      remaining_amount: Number(formData.get("amount")) - Number(formData.get("paidAmount")),
      status: "pending"
    };

    try {
      const { error } = await supabase
        .from("car_installment_payments")
        .insert(paymentData);

      if (error) throw error;

      toast.success("Payment installment added successfully");
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment installment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center p-4">
        Contract not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Car Type</p>
                <p className="font-medium">{contract.car_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{contract.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Model Year</p>
                <p className="font-medium">{contract.model_year}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Price per Car</p>
                <p className="font-medium">{formatCurrency(contract.price_per_car)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Contract Summary</CardTitle>
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Payment Installment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Installment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chequeNumber">Cheque Number</Label>
                    <Input id="chequeNumber" name="chequeNumber" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (QAR)</Label>
                    <Input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount (QAR)</Label>
                    <Input 
                      id="paidAmount" 
                      name="paidAmount" 
                      type="number" 
                      step="0.01" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input 
                      id="paymentDate" 
                      name="paymentDate" 
                      type="date" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="draweeBankName">Drawee Bank Name</Label>
                    <Input id="draweeBankName" name="draweeBankName" required />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Adding Payment..." : "Add Payment"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Total Contract Value</dt>
              <dd className="text-2xl font-bold">{formatCurrency(contract.total_contract_value)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Amount Paid</dt>
              <dd className="text-2xl font-bold text-green-600">{formatCurrency(contract.amount_paid)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Amount Pending</dt>
              <dd className="text-2xl font-bold text-red-600">{formatCurrency(contract.amount_pending)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Installments</dt>
              <dd className="text-2xl font-bold">
                {contract.remaining_installments} / {contract.total_installments}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <CarInstallmentAnalytics contractId={id!} />
        </TabsContent>

        <TabsContent value="payments">
          <CarInstallmentPayments contractId={id!} />
        </TabsContent>

        <TabsContent value="monitoring">
          <PaymentMonitoring contractId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};