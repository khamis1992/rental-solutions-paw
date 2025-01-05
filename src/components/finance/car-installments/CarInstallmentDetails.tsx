import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContractSummary } from "./components/ContractSummary";
import { AddPaymentDialog } from "./components/AddPaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarInstallmentAnalytics } from "./CarInstallmentAnalytics";
import { CarInstallmentPayments } from "./CarInstallmentPayments";
import { PaymentMonitoring } from "./PaymentMonitoring";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Loader2 } from "lucide-react";

export const CarInstallmentDetails = () => {
  const { id } = useParams();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: contract, isLoading, refetch } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="space-y-6">
      <ContractSummary 
        contract={contract} 
        onAddPayment={() => setShowPaymentDialog(true)} 
      />

      <AddPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        contractId={id!}
        onSuccess={refetch}
        totalInstallments={contract.total_installments}
      />

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <CarInstallmentAnalytics contractId={id!} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPaymentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Installment
            </Button>
          </div>
          <CarInstallmentPayments contractId={id!} />
        </TabsContent>

        <TabsContent value="monitoring">
          <PaymentMonitoring contractId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}